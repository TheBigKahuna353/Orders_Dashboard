import "./PickupTimes.css"
import React from "react"
import { DesktopPickups } from "./DesktopPickups"
import { MobilePickups } from "./MobilePickups";
import { useIsMobile } from "../Layout/isMobile";


export default function PickupTimes() {

    const [selectedDate, setSelectedDate] = React.useState(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
        });
      
      const isMobile = useIsMobile();

      if (isMobile) {
          return <MobilePickups selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      } else {
          return <DesktopPickups selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      }
}
    