import { useState } from "react";

function ImportQuests() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // store the selected file
    }
  };

  const handleJsonImport = async () => {
    if (!file) {
      alert("Please select a JSON file first!");
      return;
    }

    try {
      const text = await file.text(); // read file as text
      const quests = JSON.parse(text); // parse JSON

      console.log(quests)
      const token = localStorage.getItem("token"); // your auth token

      const res = await fetch("http://localhost:3001/api/import-quests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ quests }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Imported ${data.count} quests successfully!`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to import JSON file.");
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="w-full bg-[#0d0b1e] border border-accent/30 rounded-xl px-3 py-2 text-text focus:border-accent outline-none transition file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-[#0d0b1e] file:cursor-pointer hover:file:bg-accentAlt cursor-pointer"
      />
      <button
        type="button"
        onClick={handleJsonImport}
        className="bg-accent hover:bg-accentAlt text-[#0d0b1e] font-semibold px-6 py-2 rounded-xl shadow-lg transition"
      >
        Import
      </button>
    </div>
  );
}

export default ImportQuests;
