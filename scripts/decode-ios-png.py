"""Decode a standard or Apple CgBI PNG, preserving its original pixel artwork."""
import io
import struct
import zlib
from pathlib import Path
import argparse
from PIL import Image


def decode(data):
    chunks = []
    offset = 8
    while offset < len(data):
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        chunks.append((data[offset + 4:offset + 8], data[offset + 8:offset + 8 + length]))
        offset += length + 12
    if not any(kind == b"CgBI" for kind, _ in chunks):
        image = Image.open(io.BytesIO(data))
        image.load()
        return image
    header = next(value for kind, value in chunks if kind == b"IHDR")
    width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", header)
    if depth != 8 or color not in (2, 6) or interlace != 0:
        raise ValueError("Unsupported CgBI pixel layout")
    bpp = 4 if color == 6 else 3
    stride = width * bpp
    raw = zlib.decompress(b"".join(value for kind, value in chunks if kind == b"IDAT"), -15)
    previous = bytearray(stride)
    pixels = bytearray()
    offset = 0
    def paeth(a, b, c):
        value = a + b - c
        da, db, dc = abs(value - a), abs(value - b), abs(value - c)
        return a if da <= db and da <= dc else b if db <= dc else c
    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        row = bytearray(raw[offset:offset + stride])
        offset += stride
        for i in range(stride):
            left = row[i - bpp] if i >= bpp else 0
            up = previous[i]
            upper_left = previous[i - bpp] if i >= bpp else 0
            if filter_type == 0: predictor = 0
            elif filter_type == 1: predictor = left
            elif filter_type == 2: predictor = up
            elif filter_type == 3: predictor = (left + up) // 2
            elif filter_type == 4: predictor = paeth(left, up, upper_left)
            else: raise ValueError("Invalid PNG filter")
            row[i] = (row[i] + predictor) & 255
        pixels.extend(row)
        previous = row
    for i in range(0, len(pixels), bpp):
        pixels[i], pixels[i + 2] = pixels[i + 2], pixels[i]
        if bpp == 4 and 0 < pixels[i + 3] < 255:
            for channel in range(3):
                pixels[i + channel] = min(255, round(pixels[i + channel] * 255 / pixels[i + 3]))
    return Image.frombytes("RGBA" if bpp == 4 else "RGB", (width, height), bytes(pixels))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    decode(args.input.read_bytes()).save(args.output)
