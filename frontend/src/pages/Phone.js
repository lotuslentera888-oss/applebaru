import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useDevice } from "@/context/DeviceContext";
import { Phone as PhoneIcon, Delete, X } from "lucide-react";

const KEYS = [
  { d: "1", s: "" },
  { d: "2", s: "ABC" },
  { d: "3", s: "DEF" },
  { d: "4", s: "GHI" },
  { d: "5", s: "JKL" },
  { d: "6", s: "MNO" },
  { d: "7", s: "PQRS" },
  { d: "8", s: "TUV" },
  { d: "9", s: "WXYZ" },
  { d: "*", s: "" },
  { d: "0", s: "+" },
  { d: "#", s: "" },
];

function Barcode({ value, testId }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && value) {
      try {
        JsBarcode(ref.current, String(value), {
          format: "CODE128",
          displayValue: false,
          height: 46,
          width: 1.5,
          margin: 16,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (e) {
        /* ignore */
      }
    }
  }, [value]);
  return <svg ref={ref} data-testid={testId} className="ios-code-scan w-full h-[46px]" style={{ backgroundColor: "#ffffff" }} />;
}

function QrCode({ value, size = 128 }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    setSrc("");
    if (value) {
      QRCode.toDataURL(String(value), { margin: 1, width: size, errorCorrectionLevel: "M" })
        .then((nextSrc) => {
          if (active) setSrc(nextSrc);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [value, size]);
  return src ? (
    <img src={src} alt="IMEI values QR code" width={size} height={size} data-testid="coverage-qr" />
  ) : null;
}

function getImeiQrValue(device) {
  if (!device) return "";
  return [
    device.imei && `IMEI:${device.imei}`,
    device.imei2 && `IMEI2:${device.imei2}`,
  ]
    .filter(Boolean)
    .join(";");
}

export default function Phone() {
  const { device, refreshDevice, isOffline } = useDevice();
  const [input, setInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    refreshDevice().catch(() => {});
  }, [refreshDevice]);

  // *#06# opens the result as soon as the final key is entered; the Call
  // button remains a fallback for keyboard/screen-reader users and tests.
  useEffect(() => {
    if (input === "*#06#" && !showInfo) {
      setShowInfo(true);
      setInput("");
    }
  }, [input, showInfo]);

  const press = (d) => setInput((v) => (v.length >= 24 ? v : v + d));
  const backspace = () => setInput((v) => v.slice(0, -1));
  const closeInfo = () => {
    setShowInfo(false);
    setInput("");
  };

  const call = () => {
    if (input === "*#06#") {
      setShowInfo(true);
      setInput("");
    } else if (input.length) {
      setInput("");
    }
  };

  const CodeBlock = ({ label, value, testId }) => (
    <div className="px-4 py-3">
      <div className="text-[13px] text-[#8E8E93] mb-1.5">{label}</div>
      <div className="text-[19px] text-black font-mono tracking-wide mb-2 break-all" data-testid={`${testId}-value`}>
        {value || "—"}
      </div>
      {value && <Barcode value={value} testId={testId} />}
    </div>
  );

  const imeiQrValue = getImeiQrValue(device);
  const deviceTitle = device?.model_name || (isOffline ? "Device data unavailable" : "Loading device information…");
  const deviceSubtitle = device ? device.coverage_type || "Coverage" : "Device data unavailable";
  const sheetStatus = device
    ? isOffline
      ? "Showing saved device data. Reconnect to refresh it."
      : "Scan to view the IMEI values shown in this simulation."
    : isOffline
      ? "No saved device data. Connect to the internet to load device information."
      : "Loading device information…";
  const deviceDetails = device
    ? [device.model_name, device.color].filter(Boolean).join(" · ") || "Additional device details unavailable"
    : "Additional device details unavailable";

  return (
    <div className="relative min-h-full bg-white flex flex-col" data-testid="phone-dialer">
      {/* Number display */}
      <div className="flex-1 flex items-end justify-center px-6 pb-4 min-h-[160px]">
        <div
          data-testid="phone-display"
          className="text-[42px] leading-none tracking-wide text-black font-light text-center break-all min-h-[50px]"
        >
          {input}
        </div>
      </div>

      {/* Keypad */}
      <div className="px-6 min-[375px]:px-8 pb-2">
        <div className="grid grid-cols-3 gap-x-4 min-[375px]:gap-x-7 gap-y-4 justify-items-center">
          {KEYS.map((k) => (
            <button
              key={k.d}
              type="button"
              data-testid={`key-${k.d === "*" ? "star" : k.d === "#" ? "hash" : k.d}`}
              onClick={() => press(k.d)}
              aria-label={k.s ? `${k.d}, ${k.s}` : k.d}
              className="w-[74px] h-[74px] rounded-full bg-[#EDEDED] active:bg-[#D1D1D6] transition-colors flex flex-col items-center justify-center select-none"
            >
              <span className="text-[34px] leading-none font-normal text-black">{k.d}</span>
              {k.s && (
                <span className="text-[10px] font-semibold tracking-[2px] text-[#3C3C43] mt-0.5">
                  {k.s}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Call row */}
      <div className="grid grid-cols-3 items-center px-6 min-[375px]:px-8 pb-10 pt-1 justify-items-center">
        <span />
        <button
          type="button"
          data-testid="phone-call"
          onClick={call}
          aria-label="Call"
          className="w-[74px] h-[74px] rounded-full bg-[#34C759] active:bg-[#2FB350] transition-colors flex items-center justify-center shadow-sm"
        >
          <PhoneIcon size={32} className="text-white" fill="white" />
        </button>
        <div className="w-[74px] flex justify-center">
          {input.length > 0 && (
            <button
              type="button"
              data-testid="phone-backspace"
              onClick={backspace}
              aria-label="Delete last digit"
              className="p-3 active:opacity-50 transition-opacity"
            >
              <Delete size={26} className="text-[#3C3C43]" />
            </button>
          )}
        </div>
      </div>

      {/* Device Information sheet (result of *#06#) — with scannable IMEI barcodes */}
      {showInfo && (
        <div
          data-testid="imei-info-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="imei-info-title"
          className="absolute inset-0 z-30 bg-[#F2F2F7] flex flex-col animate-[fadeIn_0.25s_ease]"
        >
          <div className="h-[52px] shrink-0 flex items-center justify-between px-4 border-b border-[#C6C6C8] bg-white">
            <span id="imei-info-title" className="text-[17px] font-semibold text-black">Device Information</span>
            <button
              type="button"
              data-testid="imei-info-close"
              onClick={closeInfo}
              aria-label="Close device information"
              className="w-8 h-8 rounded-full bg-[#E3E3E9] flex items-center justify-center active:bg-[#D1D1D6] transition-colors"
            >
              <X size={18} className="text-[#3C3C43]" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Apple-style coverage QR card */}
            <div className="bg-white rounded-[12px] p-5 flex flex-col items-center text-center" data-testid="coverage-card">
              <div className="min-h-[144px] p-2 bg-white rounded-lg border border-[#E5E5EA] flex items-center justify-center">
                {imeiQrValue ? (
                  <QrCode value={imeiQrValue} />
                ) : (
                  <span className="px-2 text-[12px] leading-snug text-[#8E8E93]">IMEI QR unavailable</span>
                )}
              </div>
              <div className="text-[15px] font-semibold text-black mt-3">{deviceTitle}</div>
              <div className="text-[13px] text-[#8E8E93] mt-0.5">{deviceSubtitle}</div>
              <div data-testid="imei-info-status" className="text-[12px] text-[#8E8E93] mt-2 leading-snug">
                {sheetStatus}
              </div>
            </div>

            <div className="bg-white rounded-[12px] overflow-hidden divide-y divide-[#C6C6C8]">
              <CodeBlock label="IMEI" value={device?.imei} testId="barcode-imei" />
              <CodeBlock label="IMEI2" value={device?.imei2} testId="barcode-imei2" />
            </div>

            <div className="bg-white rounded-[12px] overflow-hidden">
              {[
                ["MEID", device?.meid],
                ["ICCID", device?.iccid],
                ["EID", device?.eid],
                ["SEID", device?.seeid],
              ].map(([label, value], i) => (
                <div key={label} className={`px-4 py-3 ${i > 0 ? "border-t border-[#C6C6C8]" : ""}`}>
                  <div className="text-[13px] text-[#8E8E93] mb-1">{label}</div>
                  <div className="text-[16px] text-black font-mono break-all">{value || "—"}</div>
                </div>
              ))}
            </div>

            <p className="px-2 pb-2 text-[13px] text-[#8E8E93]">{deviceDetails}</p>
          </div>
        </div>
      )}
    </div>
  );
}
