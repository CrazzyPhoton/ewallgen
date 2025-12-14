import { useState, Activity } from "react";
import { Wallet, Mnemonic, HDNodeWallet } from "ethers";
import { DiGithubBadge } from "react-icons/di";

export default function App() {
  const [homeClicked, setHomeClicked] = useState<boolean>(true);
  const [generateWalletsClicked, setGenerateWalletsClicked] =
    useState<boolean>(false);
  const [generateAddressesClicked, setGenerateAddressesClicked] =
    useState<boolean>(false);

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

  // Generate Wallets //

  const [numberOfWallets, setNumberOfWallets] = useState<string>("");
  const [limitError, setLimitError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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

  function generateWallets(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setIsGenerating(true);
    const count = parseInt(numberOfWallets, 10);
    try {
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
      console.log("Error generating wallets:", error);
      alert("Failed to generate wallets. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Generate Addresses //

  const [seedPhraseArray, setSeedPhraseArray] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isWordInputVisible, setIsWordInputVisible] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [amountOfAddresses, setAmountOfAddresses] = useState<string>("");
  const [addressLimitError, setAddressLimitError] = useState<string>("");
  const [incorrectSeedPhraseError, setIncorrectSeedPhraseError] =
    useState<string>("");

  const [isAddressesGenerating, setIsAddressesGenerating] =
    useState<boolean>(false);

  function handleSetSeedPhraseArray(index: number, value: string): void {
    const updatedArray = [...seedPhraseArray];
    updatedArray[index] = value;
    setSeedPhraseArray(updatedArray);
    setIncorrectSeedPhraseError("");
    if (!updatedArray.includes("")) {
      const isValid = Mnemonic.isValidMnemonic(updatedArray.join(" "));
      if (!isValid) {
        setIncorrectSeedPhraseError("Invalid seed phrase!");
      } else if (isValid) {
        setIncorrectSeedPhraseError("");
      }
    }
  }

  function handleWordInputFocus(index: number): void {
    const visibilityArray = [...isWordInputVisible];
    visibilityArray[index] = true;
    setIsWordInputVisible(visibilityArray);
  }

  function handleWordInputBlur(index: number): void {
    const visibilityArray = [...isWordInputVisible];
    visibilityArray[index] = false;
    setIsWordInputVisible(visibilityArray);
  }

  function handleSetAmountOfAddresses(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const value = e.target.value;
    setAmountOfAddresses(value);
    setAddressLimitError("");
    if (value.trim()) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        setAddressLimitError("Please enter a valid number!");
      } else if (numValue < 1 || numValue > 1000) {
        setAddressLimitError("Must be greater than 0 and smaller than 1001!");
      }
    }
  }

  function generateAddresses(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setIsAddressesGenerating(true);
    try {
      const csvRows = ["address_number,public_key,private_key,seed_phrase"];
      const amount = parseInt(amountOfAddresses, 10);
      const seedPhrase = seedPhraseArray.join(" ");
      const mnemonic = Mnemonic.fromPhrase(seedPhrase);

      for (let i = 0; i < amount; i++) {
        const wallet = HDNodeWallet.fromMnemonic(
          mnemonic,
          `m/44'/60'/0'/0/${i}`
        );
        csvRows.push(
          `${i + 1},${wallet.address},${wallet.privateKey},${mnemonic.phrase}`
        );
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const timestamp = getTimestamp();

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `wallet_addresses_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Error generating addresses:", error);
      alert("Failed to generate addresses. Please try again.");
    } finally {
      setIsAddressesGenerating(false);
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
          <div className="flex flex-col-reverse items-center h-full pb-12">
            <a
              href="https://github.com/CrazzyPhoton/ewallgen"
              target="_blank"
              rel="noopener noreferrer"
            >
              <DiGithubBadge className="text-5xl text-white hover:text-gray-400 transition-all duration-300" />
            </a>
          </div>
        </div>
        {homeClicked && (
          <div className="w-3/4 flex flex-col items-center gap-12 justify-center">
            <header className="text-7xl/snug font-bold w-full px-24 text-white text-center">
              Rapidly generate
              <br />
              hundreds of wallets
              <br />
              for EVM blockchains
            </header>
            <button
              onClick={handleGenerateWalletsClicked}
              className="px-14 py-4 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 text-xl text-white text-center font-semibold rounded-4xl hover:rounded-lg transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        )}
        <Activity mode={generateWalletsClicked ? "visible" : "hidden"}>
          <div className="w-3/4 flex items-center justify-center">
            <form
              onSubmit={generateWallets}
              className="w-1/2 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 flex flex-col items-center justify-start rounded-4xl pt-7 pb-10 px-7"
            >
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
                className="w-11/12 border-2 border-white rounded-4xl hover:rounded-lg bg-white/5 text-white text-center font-medium py-3 px-6 focus:outline-none mt-7 transition-all duration-300 placeholder:text-center"
                min="1"
                max="1000"
                step="1"
                placeholder="Enter number of wallets to generate (eg: 4)"
                value={numberOfWallets}
                onChange={handleSetNumberOfWallets}
                onKeyDown={blockInvalidChar}
                required
              />
              {limitError && (
                <small className="text-red-400 text-sm font-medium mt-3">
                  {limitError}
                </small>
              )}
              <button
                className="w-11/12 rounded-4xl bg-linear-to-br from-gray-600 via-gray-500 to-gray-600 text-white py-3 font-semibold mt-5 hover:rounded-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  limitError !== "" ||
                  parseInt(numberOfWallets, 10) < 1 ||
                  parseInt(numberOfWallets, 10) > 1000 ||
                  numberOfWallets.trim() === "" ||
                  isGenerating
                }
                type="submit"
              >
                {isGenerating && parseInt(numberOfWallets, 10) === 1
                  ? `Generating ${parseInt(numberOfWallets, 10)} Wallet...`
                  : isGenerating && parseInt(numberOfWallets, 10) > 1
                  ? `Generating ${parseInt(numberOfWallets, 10)} Wallets...`
                  : parseInt(numberOfWallets, 10) === 1
                  ? `Generate ${parseInt(numberOfWallets, 10)} Wallet`
                  : parseInt(numberOfWallets, 10) > 1
                  ? `Generate ${parseInt(numberOfWallets, 10)} Wallets`
                  : "Generate"}
              </button>
            </form>
          </div>
        </Activity>
        <Activity mode={generateAddressesClicked ? "visible" : "hidden"}>
          <div className="w-3/4 flex items-center justify-center">
            <form
              onSubmit={generateAddresses}
              className="w-4/5 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 flex flex-col items-center justify-start rounded-4xl pt-7 pb-10 px-7"
            >
              <strong className="text-4xl font-semibold text-white">
                Generate Addresses
              </strong>
              <p className="text-base/relaxed font-light text-white/50 px-10 text-center mt-5">
                Generate upto 1000 addresses for a wallet per generation. For
                each generation, all generated addresses would be downloaded as
                a single csv file, each address in the csv file would be denoted
                by its private key and seed phrase
              </p>
              <p className="text-xl font-semibold text-white text-center mt-5">
                Enter your 12-word seed phrase
              </p>
              <div className="flex flex-col gap-7 mt-7">
                <div className="flex gap-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type={isWordInputVisible[index] ? "text" : "password"}
                      className="w-1/6 border-2 border-white rounded-4xl hover:rounded-lg bg-white/5 text-white text-center font-medium py-3 px-3 focus:outline-none transition-all duration-300 placeholder:text-center"
                      placeholder={`Word ${index + 1}`}
                      value={seedPhraseArray[index] || ""}
                      onChange={(e) =>
                        handleSetSeedPhraseArray(index, e.target.value)
                      }
                      onFocus={() => handleWordInputFocus(index)}
                      onBlur={() => handleWordInputBlur(index)}
                      required
                    />
                  ))}
                </div>
                <div className="flex gap-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type={isWordInputVisible[index + 6] ? "text" : "password"}
                      className="w-1/6 border-2 border-white rounded-4xl hover:rounded-lg bg-white/5 text-white text-center font-medium py-3 px-3 focus:outline-none transition-all duration-300 placeholder:text-center"
                      placeholder={`Word ${index + 7}`}
                      value={seedPhraseArray[index + 6] || ""}
                      onChange={(e) =>
                        handleSetSeedPhraseArray(index + 6, e.target.value)
                      }
                      onFocus={() => handleWordInputFocus(index + 6)}
                      onBlur={() => handleWordInputBlur(index + 6)}
                      required
                    />
                  ))}
                </div>
              </div>
              {incorrectSeedPhraseError && (
                <small className="text-red-400 text-sm font-medium mt-5">
                  {incorrectSeedPhraseError}
                </small>
              )}
              <div className="flex flex-col gap-7 mt-7 items-center justify-center w-full">
                <p className="text-xl font-semibold text-white text-center">
                  Enter amount of addresses to generate
                </p>
                <input
                  type="number"
                  className="w-3/10 border-2 border-white rounded-4xl hover:rounded-lg bg-white/5 text-white text-center font-medium py-3 px-7 focus:outline-none transition-all duration-300 placeholder:text-center"
                  placeholder="Enter amount (eg: 4)"
                  min="1"
                  max="1000"
                  step="1"
                  value={amountOfAddresses}
                  onChange={handleSetAmountOfAddresses}
                  onKeyDown={blockInvalidChar}
                  required
                />
              </div>
              {addressLimitError && (
                <small className="text-red-400 text-sm font-medium mt-5">
                  {addressLimitError}
                </small>
              )}
              <button
                className="w-11/12 rounded-4xl bg-linear-to-br from-gray-600 via-gray-500 to-gray-600 text-white py-3 font-semibold mt-9 hover:rounded-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !Mnemonic.isValidMnemonic(seedPhraseArray.join(" ")) ||
                  addressLimitError !== "" ||
                  parseInt(amountOfAddresses, 10) < 1 ||
                  parseInt(amountOfAddresses, 10) > 1000 ||
                  amountOfAddresses.trim() === "" ||
                  isAddressesGenerating
                }
                type="submit"
              >
                {isAddressesGenerating && parseInt(amountOfAddresses, 10) === 1
                  ? `Generating ${parseInt(amountOfAddresses, 10)} Address...`
                  : isAddressesGenerating && parseInt(amountOfAddresses, 10) > 1
                  ? `Generating ${parseInt(amountOfAddresses, 10)} Addresses...`
                  : parseInt(amountOfAddresses, 10) === 1
                  ? `Generate ${parseInt(amountOfAddresses, 10)} Address`
                  : parseInt(amountOfAddresses, 10) > 1
                  ? `Generate ${parseInt(amountOfAddresses, 10)} Addresses`
                  : "Generate"}
              </button>
            </form>
          </div>
        </Activity>
      </div>
    </>
  );
}
