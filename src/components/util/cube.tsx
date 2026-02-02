"use client"; // add this if you plan to render inside Next.js App Router server components

export default function Cube() {
  return (
    <div className="sketchfab-embed-wrapper">
      <iframe
        src="https://sketchfab.com/models/c85a29a690624ea2b35678807652c52d/embed?autospin=1&autostart=1&preload=1&transparent=1"
       
        style={{ width: "480px", height: "480px", border: "none" }}
      ></iframe>


    </div>
  );
}
