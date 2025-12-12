import { useState } from "react";
import { Wallet } from "ethers";

export default function App() {
  const [homeClicked, setHomeClicked] = useState<boolean>(true);
  const [generateWalletsClicked, setGenerateWalletsClicked] =
    useState<boolean>(false);
  const [generateAddressesClicked, setGenerateAddressesClicked] =
    useState<boolean>(false);
  const [numberOfWallets, setNumberOfWallets] = useState<string>("");
  const [limitError, setLimitError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  function handleHomeClicked(): void {
    setHomeClicked(true);
    setGenerateWalletsClicked(false);
    setGenerateAddressesClicked(false);
  }

  function handleGenerateWalletsClicked(): void {
    setHomeClicked(false);
    setGenerateWalletsClicked(true);
    setGenerateAddressesClicked(false);
  }

  function handleGenerateAddressesClicked(): void {
    setHomeClicked(false);
    setGenerateWalletsClicked(false);
    setGenerateAddressesClicked(true);
  }

  function blockInvalidChar(e: React.KeyboardEvent<HTMLInputElement>): void {
    const invalidChars = ["e", "E", "+", "-", "."];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  }

  function handleSetNumberOfWallets(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const value = e.target.value;
    setNumberOfWallets(value);
    setLimitError("");
    if (value.trim()) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        setLimitError("Please enter a valid number!");
      } else if (numValue < 1 || numValue > 1000) {
        setLimitError("Must be greater than 0 and smaller than 1001!");
      }
    }
  }

  function getTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
  }

  async function generateWallets(): Promise<void> {
    const count = parseInt(numberOfWallets, 10);
    if (isNaN(count) || count < 1 || count > 1000) return;

    setIsGenerating(true);

    try {
      // Small delay to allow UI to update to "Generating..." state if needed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const csvRows = ["wallet_number,seed_phrase"];

      for (let i = 1; i <= count; i++) {
        // Create random wallet
        const wallet = Wallet.createRandom();
        if (wallet.mnemonic) {
          csvRows.push(`${i},${wallet.mnemonic.phrase}`);
        }
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const timestamp = getTimestamp();

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `wallets_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating wallets:", error);
      alert("Failed to generate wallets. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <div className="hidden sm:flex min-h-dvh bg-black">
        <div className="w-1/4 rounded-4xl border-r-2 border-white flex flex-col pt-10 items-center">
          <button
            className="text-5xl font-semibold hover:text-gray-400 transition-all duration-300 text-white hover:cursor-pointer"
            onClick={handleHomeClicked}
          >
            ewallgen
          </button>
          <div className="flex flex-col w-full items-center gap-12 mt-16 px-16">
            <button
              onClick={handleGenerateWalletsClicked}
              className={`w-full py-4 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 text-xl text-white text-center font-semibold rounded-4xl hover:rounded-lg transition-all duration-300 ${
                generateWalletsClicked ? "ring-3 ring-white" : ""
              }`}
            >
              Generate Wallets
            </button>
            <button
              onClick={handleGenerateAddressesClicked}
              className={`w-full py-4 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 text-xl text-white text-center font-semibold rounded-4xl hover:rounded-lg transition-all duration-300 ${
                generateAddressesClicked ? "ring-3 ring-white" : ""
              }`}
            >
              Generate Addresses
            </button>
          </div>
        </div>
        {homeClicked && (
          <div className="w-3/4 flex flex-col items-center gap-12 justify-center">
            <header className="text-7xl/snug font-bold w-full px-24 text-white text-center">
              Rapidly generate 1000s of wallets for EVM blockchains
            </header>
            <button
              onClick={handleGenerateWalletsClicked}
              className="px-14 py-4 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 text-xl text-white text-center font-semibold rounded-4xl hover:rounded-lg transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        )}
        {generateWalletsClicked && (
          <div className="w-3/4 flex items-center justify-center">
            <div className="w-1/2 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 flex flex-col items-center justify-start rounded-4xl pt-7 pb-10 px-7">
              <strong className="text-4xl font-semibold text-white">
                Generate Wallets
              </strong>
              <p className="text-base/relaxed font-light text-white/50 px-10 text-center mt-5">
                Generate upto 1000 wallets per generation. For each generation,
                all generated wallets would be downloaded as a single csv file,
                each wallet in the csv file would be denoted by its seed phrase
              </p>
              <input
                type="number"
                className="w-11/12 border-2 border-white rounded-4xl hover:rounded-lg bg-white/5 text-white font-medium py-3 px-6 focus:outline-none mt-7 transition-all duration-300"
                min="1"
                max="1000"
                step="1"
                placeholder="Enter number of wallets to generate (eg: 4)"
                value={numberOfWallets}
                onChange={handleSetNumberOfWallets}
                onKeyDown={blockInvalidChar}
              />
              <small className="text-red-400 text-sm font-medium mt-3">
                {limitError}
              </small>
              <button
                className="w-11/12 rounded-4xl bg-linear-to-br from-gray-600 via-gray-500 to-gray-600 text-white py-3 font-semibold mt-5 hover:rounded-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  limitError !== "" ||
                  parseInt(numberOfWallets, 10) < 1 ||
                  parseInt(numberOfWallets, 10) > 1000 ||
                  numberOfWallets.trim() === "" ||
                  isGenerating
                }
                onClick={generateWallets}
              >
                {isGenerating && parseInt(numberOfWallets, 10) === 1
                  ? `Generating ${parseInt(numberOfWallets, 10)} wallet...`
                  : isGenerating && parseInt(numberOfWallets, 10) > 1
                  ? `Generating ${parseInt(numberOfWallets, 10)} wallets...`
                  : parseInt(numberOfWallets, 10) === 1
                  ? `Generate ${parseInt(numberOfWallets, 10)} Wallet`
                  : parseInt(numberOfWallets, 10) > 1
                  ? `Generate ${parseInt(numberOfWallets, 10)} Wallets`
                  : "Generate"}
              </button>
            </div>
          </div>
        )}
        {generateAddressesClicked && <div className="w-3/4"></div>}
      </div>
    </>
  );
}
