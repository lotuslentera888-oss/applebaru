#!/usr/bin/env swift

import AppKit
import Darwin
import Foundation

private struct SymbolEntry {
    let key: String
    let symbolName: String
    let required: Bool
}

private enum ExportError: LocalizedError {
    case usage
    case requiredSymbolFailed(key: String, reason: String)
    case invalidOutputDirectory
    case invalidSymbolSize(key: String)
    case pngEncodingFailed(key: String)

    var errorDescription: String? {
        switch self {
        case .usage:
            return "usage: export-sf-symbols.swift OUTPUT_DIR"
        case let .requiredSymbolFailed(key, reason):
            return "required symbol \(key) could not be exported: \(reason)"
        case .invalidOutputDirectory:
            return "OUTPUT_DIR must be a directory path"
        case let .invalidSymbolSize(key):
            return "symbol \(key) returned an invalid size"
        case let .pngEncodingFailed(key):
            return "symbol \(key) could not be encoded as PNG"
        }
    }
}

private let symbols: [SymbolEntry] = [
    SymbolEntry(key: "action-button", symbolName: "button.programmable", required: false),
    SymbolEntry(key: "general", symbolName: "gearshape", required: true),
    SymbolEntry(key: "search", symbolName: "magnifyingglass", required: false),
    SymbolEntry(key: "standby", symbolName: "clock.fill", required: false),
    SymbolEntry(key: "plane", symbolName: "airplane", required: false),
    SymbolEntry(key: "wifi", symbolName: "wifi", required: false),
    SymbolEntry(key: "antenna", symbolName: "antenna.radiowaves.left.and.right", required: true),
    SymbolEntry(key: "link", symbolName: "personalhotspot", required: false),
    SymbolEntry(key: "bell", symbolName: "bell.fill", required: false),
    SymbolEntry(key: "volume", symbolName: "speaker.wave.3.fill", required: false),
    SymbolEntry(key: "moon", symbolName: "moon.fill", required: false),
    SymbolEntry(key: "hourglass", symbolName: "hourglass", required: false),
    SymbolEntry(key: "sliders", symbolName: "slider.horizontal.3", required: false),
    SymbolEntry(key: "sun", symbolName: "sun.max.fill", required: false),
    SymbolEntry(key: "grid", symbolName: "square.grid.2x2.fill", required: false),
    SymbolEntry(key: "accessibility", symbolName: "accessibility", required: false),
    SymbolEntry(key: "image", symbolName: "photo.fill", required: false),
    SymbolEntry(key: "hand", symbolName: "hand.raised.fill", required: false),
    SymbolEntry(key: "key", symbolName: "key.fill", required: false),
    SymbolEntry(key: "apps", symbolName: "square.stack.3d.up.fill", required: false),
    SymbolEntry(key: "appstore", symbolName: "app.badge.fill", required: false),
    SymbolEntry(key: "music", symbolName: "music.note", required: false),
    SymbolEntry(key: "face", symbolName: "faceid", required: false),
    SymbolEntry(key: "siren", symbolName: "sos.circle.fill", required: false),
    SymbolEntry(key: "battery", symbolName: "battery.100", required: false),
    SymbolEntry(key: "sparkles", symbolName: "sparkles", required: false),
    SymbolEntry(key: "camera", symbolName: "camera.fill", required: false),
    SymbolEntry(key: "circle", symbolName: "switch.2", required: false),
    SymbolEntry(key: "shield", symbolName: "checkmark.shield.fill", required: false),
]

private let canvasPointSize = CGFloat(22)
private let canvasPixels = 88

private func exportSymbol(_ entry: SymbolEntry, to outputDirectory: URL) throws {
    guard let symbol = NSImage(
        systemSymbolName: entry.symbolName,
        accessibilityDescription: entry.symbolName
    ) else {
        throw ExportError.requiredSymbolFailed(key: entry.key, reason: "SF Symbol \(entry.symbolName) is unavailable")
    }

    let configuration = NSImage.SymbolConfiguration(pointSize: canvasPointSize, weight: .regular)
    guard let configuredSymbol = symbol.withSymbolConfiguration(configuration) else {
        throw ExportError.requiredSymbolFailed(key: entry.key, reason: "symbol configuration was unavailable")
    }

    let sourceSize = configuredSymbol.size
    guard sourceSize.width > 0, sourceSize.height > 0 else {
        throw ExportError.invalidSymbolSize(key: entry.key)
    }

    // Use a 4x bitmap representation with a 22pt logical size. The source image
    // is fitted without distortion, then its alpha is filled with opaque white.
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: canvasPixels,
        pixelsHigh: canvasPixels,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bitmapFormat: [],
        bytesPerRow: 0,
        bitsPerPixel: 32
    ) else {
        throw ExportError.pngEncodingFailed(key: entry.key)
    }
    bitmap.size = NSSize(width: canvasPointSize, height: canvasPointSize)

    guard let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
        throw ExportError.pngEncodingFailed(key: entry.key)
    }

    let canvasRect = NSRect(x: 0, y: 0, width: canvasPointSize, height: canvasPointSize)
    let scale = min(canvasRect.width / sourceSize.width, canvasRect.height / sourceSize.height)
    let fittedSize = NSSize(width: sourceSize.width * scale, height: sourceSize.height * scale)
    let destination = NSRect(
        x: canvasRect.midX - fittedSize.width / 2,
        y: canvasRect.midY - fittedSize.height / 2,
        width: fittedSize.width,
        height: fittedSize.height
    )

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = graphicsContext
    defer { NSGraphicsContext.restoreGraphicsState() }

    let context = graphicsContext.cgContext
    let desiredScale = CGFloat(canvasPixels) / canvasPointSize
    let existingScaleX = abs(context.ctm.a)
    let existingScaleY = abs(context.ctm.d)
    if existingScaleX > 0 && existingScaleY > 0 {
        context.scaleBy(x: desiredScale / existingScaleX, y: desiredScale / existingScaleY)
    }
    context.clear(canvasRect)
    context.interpolationQuality = .high
    configuredSymbol.draw(
        in: destination,
        from: NSRect(origin: .zero, size: sourceSize),
        operation: .sourceOver,
        fraction: 1
    )

    // Native source-in compositing preserves the rendered SF Symbol alpha while
    // replacing its color with opaque white; no custom glyph geometry is drawn.
    context.setBlendMode(.sourceIn)
    context.setFillColor(NSColor.white.cgColor)
    context.fill(canvasRect)

    guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
        throw ExportError.pngEncodingFailed(key: entry.key)
    }
    let outputURL = outputDirectory.appendingPathComponent("\(entry.key).png", isDirectory: false)
    try pngData.write(to: outputURL, options: .atomic)
}

private func run() throws {
    guard CommandLine.arguments.count == 2 else {
        throw ExportError.usage
    }

    let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
    var isDirectory: ObjCBool = false
    let fileManager = FileManager.default
    if fileManager.fileExists(atPath: outputDirectory.path, isDirectory: &isDirectory), !isDirectory.boolValue {
        throw ExportError.invalidOutputDirectory
    }
    try fileManager.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

    print("[sf-symbols] exporting 22pt symbols to \(outputDirectory.path) (88x88 PNG)")
    var exportedKeys = Set<String>()

    for entry in symbols {
        do {
            try exportSymbol(entry, to: outputDirectory)
            exportedKeys.insert(entry.key)
            print("[sf-symbols] exported \(entry.key) (\(entry.symbolName))")
        } catch {
            if entry.required {
                throw ExportError.requiredSymbolFailed(key: entry.key, reason: error.localizedDescription)
            }
            print("[sf-symbols] skipped \(entry.key) (\(entry.symbolName)): \(error.localizedDescription)")
        }
    }

    guard exportedKeys.contains("antenna") else {
        throw ExportError.requiredSymbolFailed(key: "antenna", reason: "no PNG was produced")
    }
    print("[sf-symbols] complete: \(exportedKeys.count)/\(symbols.count) symbols available")
}

do {
    try run()
} catch {
    print("[sf-symbols] error: \(error.localizedDescription)")
    exit(EXIT_FAILURE)
}
