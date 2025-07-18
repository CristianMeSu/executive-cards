import { useState, useEffect } from "react";
import QRCodeStyling from "qr-code-styling";
import { data } from "../data/personas.js";
import html2canvas from "html2canvas";

export default function QrGenerator() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [qrInstance, setQrInstance] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      type: "svg",
      image: "/directorio/assets/logo-solofondo.png",
      data: "",
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 3,
        imageSize: 0.4,
      },
      dotsOptions: {
        type: "dots",
        color: "#23346f",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#23346f",
      },
      cornersDotOptions: {
        type: "extra-rounded",
        color: "#23346f",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
    });
    setQrInstance(qr);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setError("");
    if (value.trim()) {
      const q = value.trim().toLowerCase();
      const matches = data.filter(
        ({ nombre, apellido }) =>
          nombre.toLowerCase().includes(q) || apellido.toLowerCase().includes(q)
      );
      setResults(matches);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (persona) => {
    setQuery(`${persona.nombre} ${persona.apellido}`);
    setResults([]);
    setSelectedPersona(persona); // <-- guarda la persona
    generateQRFor(persona);
  };

  const generateQRFor = (persona) => {
    const url = `https://itmgroup.mx/directorio/${persona.id}/`;
    if (qrInstance) {
      qrInstance.update({ data: url });
      const qrContainer = document.getElementById("styled-qr");
      if (qrContainer) {
        qrContainer.innerHTML = "";
        qrInstance.append(qrContainer);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const persona = data.find(({ nombre, apellido }) => {
      const q = query.trim().toLowerCase();
      return (
        nombre.toLowerCase().includes(q) || apellido.toLowerCase().includes(q)
      );
    });
    if (!persona) {
      setError(`No se encontr\u00f3 nadie con "${query}".`);
      return;
    }
    setSelectedPersona(persona); // <-- guarda la persona
    generateQRFor(persona);
  };

const handleDownload = async () => {
  const area = document.getElementById("download-area");
  if (!area) return;

  // Clonar el área a capturar
  const cloned = area.cloneNode(true);
  cloned.style.width = "375px";
  cloned.style.height = "667px";
  cloned.style.position = "absolute";
  cloned.style.top = "-10000px"; // fuera de pantalla
  cloned.style.left = "0";
  cloned.style.transform = "scale(1)";
  cloned.style.zoom = "1";
  cloned.style.zIndex = "-9999"; // no interfiere
const downloadButton = cloned.querySelector(".descarga");
if (downloadButton) {
  downloadButton.style.display = "none";
}
  document.body.appendChild(cloned); // Añadir al DOM temporalmente

  // Esperar a que cargue cualquier imagen interna si es necesario
  await new Promise((r) => setTimeout(r, 100));

  const canvas = await html2canvas(cloned, {
    useCORS: true,
    scale: 2,
    width: 375,
    height: 667,
    windowWidth: 375,
    windowHeight: 667,
  });

  document.body.removeChild(cloned); // Limpiar el DOM

  const link = document.createElement("a");
  link.download = `qr-${query.trim()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};



  return (
    <div className="w-screen h-screen mx-auto text-center items-center flex flex-col  z-0">
      <form
        onSubmit={handleSubmit}
        className=" w-80 top-12 md:top-5 absolute z-2"
      >
        <div className="flex flex-row relative">
          <input
            type="text"
            placeholder="  Nombre o apellido"
            value={query}
            onChange={handleInputChange}
            className="w-full p-2 rounded-full pl-5 bg-white input-search"
          />
          <img
            src="/directorio/assets/lupa.svg"
            alt="lupa"
            className="w-6 h-6 absolute right-2 mr-2 mt-2"
          />
        </div>
        {results.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded-xl w-full mt-1 max-h-40 overflow-auto">
            {results.map((persona) => (
              <li
                key={persona.id}
                onClick={() => handleSelect(persona)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {persona.nombre} {persona.apellido}
              </li>
            ))}
          </ul>
        )}
      </form>
      <div
        id="download-area"
        className="gen-container absolute w-screen h-screen mx-auto text-center items-center flex flex-col justify-center z-1"
      >
        <div className="opacity-container w-screen h-screen mx-auto p-4 text-center items-center flex flex-col ">
          <div className="w-full max-w-md mx-auto mt-15 md:mt-5 justify-center items-center flex flex-col relative">
            <div className="flex flex-col top-12 absolute items-center justify-center bg-white p-4 rounded-4xl shadow-md">
              <img
                src="/directorio/assets/logo.png"
                alt="logo"
                className="logo-qr absolute  z-20 h-20"
              />
              <div className="w-[300px] h-[300px]"></div>
            </div>
          </div>

          {error && <p className="mt-3 text-red-600">{error}</p>}

          {!error && query && (
            <div className="mt-12 w-full text-center relative flex flex-col items-center">
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-4xl shadow-md">
                <div
                  id="styled-qr"
                  className="w-[300px] h-[300px] rounded-4xl transition-all duration-500 ease-in-out"
                ></div>
              </div>
              {selectedPersona && (
                <>
                  <h2 className="px-10 uppercase  mt-2 text-lg  poppins full-name pb-4 name text-white">
                    {selectedPersona.nombre} {selectedPersona.apellido}
                  </h2>
                  <h3 className="px-10 uppercase text-xl  poppins job mb-2 text-white">
                    {selectedPersona.puesto}
                  </h3>
                </>
              )}

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center absolute descarga"
              >
                <img
                  src="/directorio/assets/descarga.svg"
                  alt="descargar"
                  className="w-10 h-10 transition-all duration-500 ease-in-out animate-fadeIn"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
