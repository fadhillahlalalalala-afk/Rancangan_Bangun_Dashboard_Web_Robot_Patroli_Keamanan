export function BatteryMeter({ value }: { value: number }) {
  return (
    <div className="meter">
      <div className={`meter-bar ${value < 30 ? "low" : ""}`} role="img" aria-label={`Baterai ${value} persen`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}
