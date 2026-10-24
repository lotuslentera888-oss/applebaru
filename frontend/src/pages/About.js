import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ios/Chrome";
import { IosGroup, IosInfoRow, IosSectionFooter } from "@/components/ios/IosList";
import OfflineBanner from "@/components/ios/OfflineBanner";
import { useDevice } from "@/context/DeviceContext";

export default function About() {
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from === "/account" ? "/account" : "/general";
  const { device: d, refreshDevice, isOffline } = useDevice();

  useEffect(() => {
    refreshDevice().catch(() => {});
  }, [refreshDevice]);

  return (
    <div className="pb-10" data-testid="about-page">
      <NavHeader title="About" onBack={() => navigate(backPath)} backLabel={backPath === "/account" ? "Apple Account" : "General"} />

      <OfflineBanner />

      {!d && (
        <div className="px-6 pt-16 text-center text-[15px] text-gray-500" data-testid="about-empty">
          {isOffline
            ? "Belum ada data tersimpan. Sambungkan ke internet untuk memuat data perangkat."
            : "Memuat…"}
        </div>
      )}

      {d && (
        <div className="space-y-5 pt-4">
          <IosGroup>
            <IosInfoRow label="Name" value={d.device_name} testId="about-name" />
            <IosInfoRow label="iOS Version" value={d.ios_version} testId="about-ios" />
            <IosInfoRow label="Model Name" value={d.model_name} testId="about-model-name" />
            <IosInfoRow label="Model Number" value={d.model_number} mono testId="about-model-number" />
            <IosInfoRow label="Serial Number" value={d.serial_number} mono testId="about-serial" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Part Number" value={d.part_number} testId="about-part-number" />
            <IosInfoRow label="Color" value={d.color} testId="about-color" />
            <IosInfoRow label="Build Version" value={d.build_version} mono testId="about-build" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Coverage" value={d.coverage_type} testId="about-coverage" />
            <IosInfoRow label="Warranty" value={d.warranty_status} testId="about-warranty" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Songs" value={d.songs} testId="about-songs" />
            <IosInfoRow label="Videos" value={d.videos} testId="about-videos" />
            <IosInfoRow label="Photos" value={d.photos} testId="about-photos" />
            <IosInfoRow label="Applications" value={d.applications} testId="about-apps" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Capacity" value={d.capacity} testId="about-capacity" />
            <IosInfoRow label="Available" value={d.available} testId="about-available" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Carrier" value={d.carrier} testId="about-carrier" />
            <IosInfoRow label="Network Provider" value={d.carrier_version} testId="about-carrier-version" />
            <IosInfoRow label="Carrier Lock" value={d.carrier_lock} testId="about-carrier-lock" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="IMEI" value={d.imei} mono testId="about-imei" />
            <IosInfoRow label="IMEI2" value={d.imei2} mono testId="about-imei2" />
            <IosInfoRow label="MEID" value={d.meid} mono testId="about-meid" />
            <IosInfoRow label="ICCID" value={d.iccid} mono testId="about-iccid" />
            <IosInfoRow label="EID" value={d.eid} mono testId="about-eid" />
            <IosInfoRow label="SEID" value={d.seeid} mono testId="about-seid" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Modem Firmware" value={d.modem_firmware} mono testId="about-modem" />
            <IosInfoRow label="Wi-Fi Address" value={d.wifi_address} mono testId="about-wifi" />
            <IosInfoRow label="Bluetooth" value={d.bluetooth} mono testId="about-bt" />
          </IosGroup>

          <IosGroup>
            <IosInfoRow label="Certificate Trust Store" value={d.certificate_trust_store} mono testId="about-cts" />
            <IosInfoRow label="Battery Max Capacity" value={d.battery_max_capacity} testId="about-battery" />
            <IosInfoRow label="Charge Cycles" value={d.battery_charge_cycles} testId="about-cycles" />
          </IosGroup>

          <IosSectionFooter>
            {d.region} · Purchased {d.purchase_date}
          </IosSectionFooter>
        </div>
      )}
    </div>
  );
}
