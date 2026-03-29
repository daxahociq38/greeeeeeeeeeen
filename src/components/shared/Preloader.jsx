export default function Preloader() {
  return (
    <div className="gw-preloader-screen">
      <div className="flex flex-col items-center gap-5">
        <div className="gw-preloader-bars">
          <div className="gw-preloader-bar" />
          <div className="gw-preloader-bar" />
          <div className="gw-preloader-bar" />
        </div>
        <p className="gw-preloader-text">GreenWay</p>
      </div>
    </div>
  );
}
