export default function AdSlot({ height = 100 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        margin: "16px 0",
        background: "transparent",
        border: "1px dashed #D8D2C6",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "#AFA999",
        textTransform: "uppercase",
        letterSpacing: ".04em",
      }}
    >
      Рекламный блок
    </div>
  );
}
