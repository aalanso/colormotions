import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
import { db, localFootprint } from "../components/Firebase";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { useRef } from "react";
import Link from "next/link";
import AuthorCard from "../components/AuthorCard";

var ansPack = [];

const submitColorPacket = async (_colors) => {
  try {
    const docRef = await addDoc(collection(db, "Submits"), {
      c0: _colors[0],
      c1: _colors[1],
      c2: _colors[2],
      c3: _colors[3],
      c4: _colors[4],
      c5: _colors[5],
      c6: _colors[6],
      c7: _colors[7],
      c8: _colors[8],
    });
    console.log("Document written with ID: ", docRef.id);
    localStorage.setItem(localFootprint, docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default function Home() {
  const [uiType, setUiType] = useState(1);
  const [slide, setSlide] = useState(0);

  var emotionsArr = [
    "Joy",
    "Fear",
    "Loneliness",
    "Love",
    "Trust",
    "Anxiety",
    "Anger",
    "Despair",
    "Hope",
  ];

  const [color, setColor] = useState("#ffffff");
  const [rgbaColor, setRgbaColor] = useState({ r: 255, g: 255, b: 255, a: 1 });
  const [currentEmotion, setCurrentEmotion] = useState("");
  const [step, setStep] = useState(0);
  const outof = 9;

  const cpanelRef = useRef(null);
  const emtextRef = useRef(null);

  const handleChange = (clr) => {
    //console.log("🎨", clr);
    setColor(clr);
    setRgbaColor(hexToRgbA(clr));
    //console.log(colorString);
    //
  };

  const handleNext = () => {
    var curr = step;
    setStep(curr + 1);
    setCurrentEmotion(emotionsArr[curr]);
    var colorread = color;
    ansPack.push(colorread);
    console.log(ansPack);

    // reset picker and bg color and text color
    setColor("#ffffff");
    if (cpanelRef.current != null) {
      cpanelRef.current.setAttribute("style", `background-color: #ffffff`);
    }
    if (emtextRef.current != null) {
      emtextRef.current.setAttribute("style", `color: #000000`);
    }
  };

  const handleFinished = () => {
    var colorread = color;
    ansPack.push(colorread);
    console.log(ansPack);
    if (cpanelRef.current != null) {
      cpanelRef.current.setAttribute("style", `background-color: #ffffff`);
    }
    if (emtextRef.current != null) {
      emtextRef.current.setAttribute("style", `color: #000000`);
    }
    submitColorPacket(ansPack);
    console.log("submitting answer pack:");
    console.log(ansPack);
    setSlide(3);
  };

  const getBrightness = ({ r, g, b, a }) =>
    (r * 299 + g * 587 + b * 114) / 1000;

  const colorString = `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`;
  //var cpanelRef = document.getElementById("colorpanel");
  //var emtextRef = document.getElementById("emtext");

  useEffect(() => {
    if (cpanelRef.current != null) {
      cpanelRef.current.setAttribute(
        "style",
        `background-color: ${colorString}`
      );
    }
  }, [colorString]);

  const hexToRgbA = (hex) => {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255, a: 1 };
    }
    throw new Error("Bad Hex");
  };

  const textColor =
    getBrightness(rgbaColor) > 128 || rgbaColor.a < 0.5 ? "#000" : "#FFF";

  useEffect(() => {
    if (emtextRef.current != null) {
      emtextRef.current.setAttribute("style", `color: ${textColor}`);
    }
  }, [textColor]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setSlide(1);
    }, 2500);
    const timer2 = setTimeout(() => {
      setSlide(2);
    }, 7000);

    setCurrentEmotion(emotionsArr[0]);
    setStep(1);

    const ls_resp = localStorage.getItem(localFootprint);
    if (ls_resp != null) setUiType(2);
  }, []);

  if (isBrowser && isMobile) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-white text-[5vh] text-black font-['system-ui'] animate-[opacityFadeIn_800ms_linear_1] font-medium">
        <title>Colormotions</title>
        {uiType === 1 ? (
          slide === 0 ? (
            <div className="font-['Harabara']">Welcome to Colormotions!</div>
          ) : slide === 1 ? (
            <div className="flex flex-col items-center text-[3vh] animate-[opacityFadeIn_800ms_linear_1]">
              <div>
                Your task is to select a color that, in Your opinion, best
                matches the word on the screen.
              </div>
            </div>
          ) : slide === 3 ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="font-['Harabara']">{`Thank You! ❤️`}</div>
              <AuthorCard />
            </div>
          ) : (
            <div ref={cpanelRef} className={`w-screen h-screen flex flex-col`}>
              <div className="w-full h-[84%] flex items-center justify-center">
                <div ref={emtextRef} className="font-['Harabara'] text-[10vh]">
                  {currentEmotion}
                </div>
              </div>
              <div className="flex flex-row w-full h-[15%] items-center justify-center pickerwrapper mb-[6vh]">
                <HexColorPicker color={color} onChange={handleChange} />
                {step === 9 ? (
                  <div
                    onClick={() => handleFinished()}
                    className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-full w-[8%] rounded-[10px] mx-[2vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                  >
                    <div className="">Submit</div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="3vh"
                      height="3vh"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="white"
                        d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    onClick={() => handleNext()}
                    className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-full w-[8%] rounded-[10px] mx-[2vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                  >
                    <div>Next</div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="3vh"
                      height="3vh"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="white"
                        d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                      />
                    </svg>
                  </div>
                )}

                <div className="bg-black opacity-85 flex flex-row items-center justify-between text-white text-[2vh] h-full w-[40%] rounded-[10px] mr-[2vh]">
                  <div className="w-[20%] h-full flex items-center justify-center">
                    <svg
                      className="mx-[2vw]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="3vw"
                      height="3vw"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 72 72"
                    >
                      <g stroke-miterlimit="10" stroke-width="2">
                        <path
                          fill="#A57939"
                          d="M59 36c-.25-.75-.71-2.1-2-3c-1.56-1.08-3.63-1.01-4-1c-.76.03-1.18.16-2 0c-.58-.12-1.53-.3-2-1c-.4-.59-.15-1.08 0-3c.12-1.51.17-2.27 0-3c-.37-1.58-1.49-2.56-2-3c-1.05-.92-2.38-1.56-5-2c-1.82-.31-4.75-.6-9 0c-2.15.3-5.46.87-8 1.72c-1.77.58-3.74 1.41-6 3c-.02.01-.04.02-.05.03c-3.44 2.24-5.39 6.2-5.22 10.31C14.64 57.13 54.56 59.91 59 41c.09-.6.79-2.65 0-5zm-20.79-5.88a2.76 2.76 0 0 1-2.76-2.76c0-1.53 1.23-2.76 2.76-2.76h2.71a2.76 2.76 0 1 1 0 5.52h-2.71z"
                        />
                        <circle cx="20" cy="33" r="3" fill="#61B2E4" />
                        <circle cx="25" cy="42" r="3" fill="#5C9E31" />
                        <circle cx="35" cy="45" r="3" fill="#FCEA2B" />
                        <circle cx="45" cy="44" r="3" fill="#D22F27" />
                      </g>
                      <g
                        fill="none"
                        stroke="#000"
                        stroke-miterlimit="10"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M59 36c-.25-.75-.71-2.1-2-3c-1.56-1.08-3.63-1.01-4-1c-.76.03-1.18.16-2 0c-.58-.12-1.53-.3-2-1c-.4-.59-.15-1.08 0-3c.12-1.51.17-2.27 0-3c-.37-1.58-1.49-2.56-2-3c-1.05-.92-2.38-1.56-5-2c-1.82-.31-4.75-.6-9 0c-2.15.3-5.46.87-8 1.72c-1.77.58-3.74 1.41-6 3c-.02.01-.04.02-.05.03c-3.44 2.24-5.39 6.2-5.22 10.31C14.64 57.13 54.56 59.91 59 41c.09-.6.79-2.65 0-5zm-20.79-5.88a2.76 2.76 0 0 1-2.76-2.76c0-1.53 1.23-2.76 2.76-2.76h2.71a2.76 2.76 0 1 1 0 5.52h-2.71z"
                        />
                        <circle cx="20" cy="33" r="3" />
                        <circle
                          cx="25"
                          cy="42"
                          r="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle cx="35" cy="45" r="3" />
                        <circle cx="45" cy="44" r="3" />
                      </g>
                    </svg>
                  </div>

                  <div className="w-[60%]">
                    Your task is to select a color that, in Your opinion, best
                    matches the word on the screen.
                  </div>
                  <div className="w-[20%] h-full flex items-center justify-center">
                    <div className="">
                      {step} / {outof}
                    </div>
                  </div>
                </div>
                <Link
                  href="https://github.com/aalanso/Colormotions"
                  className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-full w-[10%] rounded-[10px] cursor-pointer transition-all ease-in-out hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2vw"
                    height="2vw"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none">
                      <path d="M0 0h24v24H0z" />
                      <path
                        fill="white"
                        d="M7.024 2.31a9.08 9.08 0 0 1 2.125 1.046A11.432 11.432 0 0 1 12 3c.993 0 1.951.124 2.849.355a9.08 9.08 0 0 1 2.124-1.045c.697-.237 1.69-.621 2.28.032c.4.444.5 1.188.571 1.756c.08.634.099 1.46-.111 2.28C20.516 7.415 21 8.652 21 10c0 2.042-1.106 3.815-2.743 5.043a9.456 9.456 0 0 1-2.59 1.356c.214.49.333 1.032.333 1.601v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-.991c-.955.117-1.756.013-2.437-.276c-.712-.302-1.208-.77-1.581-1.218c-.354-.424-.74-1.38-1.298-1.566a1 1 0 0 1 .632-1.898c.666.222 1.1.702 1.397 1.088c.48.62.87 1.43 1.63 1.753c.313.133.772.22 1.49.122L8 17.98a3.986 3.986 0 0 1 .333-1.581a9.455 9.455 0 0 1-2.59-1.356C4.106 13.815 3 12.043 3 10c0-1.346.483-2.582 1.284-3.618c-.21-.82-.192-1.648-.112-2.283l.005-.038c.073-.582.158-1.267.566-1.719c.59-.653 1.584-.268 2.28-.031Z"
                      />
                    </g>
                  </svg>
                  <div>About this</div>
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="font-['Harabara']">{`Thank You! ❤️`}</div>
            <div className="text-[3vh]">
              You&apos;ve already submitted Your answer.
            </div>
            <AuthorCard />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-white text-[5vh] text-black font-['system-ui'] animate-[opacityFadeIn_800ms_linear_1] font-medium">
      <BrowserView className="w-screen h-screen flex flex-col justify-center items-center bg-white text-[5vh] text-black font-['system-ui'] animate-[opacityFadeIn_800ms_linear_1] font-medium">
        <title>Colormotions</title>
        {uiType === 1 ? (
          slide === 0 ? (
            <div className="font-['Harabara'] w-[50%] flex items-center justify-center">
              <div>Welcome to Colormotions!</div>
            </div>
          ) : slide === 1 ? (
            <div className="flex flex-col items-center text-[3vh] animate-[opacityFadeIn_800ms_linear_1]">
              <div>
                Your task is to select a color that, in Your opinion, best
                matches the word on the screen.
              </div>
            </div>
          ) : slide === 3 ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="font-['Harabara']">{`Thank You! ❤️`}</div>
              <AuthorCard />
            </div>
          ) : (
            <div ref={cpanelRef} className={`w-screen h-screen flex flex-col`}>
              <div className="w-full h-[84%] flex items-center justify-center">
                <div ref={emtextRef} className="font-['Harabara'] text-[10vh]">
                  {currentEmotion}
                </div>
              </div>
              <div className="flex flex-row w-full h-[15%] items-center justify-center pickerwrapper">
                <HexColorPicker color={color} onChange={handleChange} />
                {step === 9 ? (
                  <div
                    onClick={() => handleFinished()}
                    className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-full w-[8%] rounded-[10px] mx-[2vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                  >
                    <div className="">Submit</div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="3vh"
                      height="3vh"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="white"
                        d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    onClick={() => handleNext()}
                    className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-full w-[8%] rounded-[10px] mx-[2vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                  >
                    <div>Next</div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="3vh"
                      height="3vh"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="white"
                        d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                      />
                    </svg>
                  </div>
                )}

                <div className="bg-black opacity-85 flex flex-row items-center justify-between text-white text-[2vh] h-full w-[40%] rounded-[10px] mr-[2vh]">
                  <div className="w-[20%] h-full flex items-center justify-center">
                    <svg
                      className="mx-[2vw]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="3vw"
                      height="3vw"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 72 72"
                    >
                      <g stroke-miterlimit="10" stroke-width="2">
                        <path
                          fill="#A57939"
                          d="M59 36c-.25-.75-.71-2.1-2-3c-1.56-1.08-3.63-1.01-4-1c-.76.03-1.18.16-2 0c-.58-.12-1.53-.3-2-1c-.4-.59-.15-1.08 0-3c.12-1.51.17-2.27 0-3c-.37-1.58-1.49-2.56-2-3c-1.05-.92-2.38-1.56-5-2c-1.82-.31-4.75-.6-9 0c-2.15.3-5.46.87-8 1.72c-1.77.58-3.74 1.41-6 3c-.02.01-.04.02-.05.03c-3.44 2.24-5.39 6.2-5.22 10.31C14.64 57.13 54.56 59.91 59 41c.09-.6.79-2.65 0-5zm-20.79-5.88a2.76 2.76 0 0 1-2.76-2.76c0-1.53 1.23-2.76 2.76-2.76h2.71a2.76 2.76 0 1 1 0 5.52h-2.71z"
                        />
                        <circle cx="20" cy="33" r="3" fill="#61B2E4" />
                        <circle cx="25" cy="42" r="3" fill="#5C9E31" />
                        <circle cx="35" cy="45" r="3" fill="#FCEA2B" />
                        <circle cx="45" cy="44" r="3" fill="#D22F27" />
                      </g>
                      <g
                        fill="none"
                        stroke="#000"
                        stroke-miterlimit="10"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M59 36c-.25-.75-.71-2.1-2-3c-1.56-1.08-3.63-1.01-4-1c-.76.03-1.18.16-2 0c-.58-.12-1.53-.3-2-1c-.4-.59-.15-1.08 0-3c.12-1.51.17-2.27 0-3c-.37-1.58-1.49-2.56-2-3c-1.05-.92-2.38-1.56-5-2c-1.82-.31-4.75-.6-9 0c-2.15.3-5.46.87-8 1.72c-1.77.58-3.74 1.41-6 3c-.02.01-.04.02-.05.03c-3.44 2.24-5.39 6.2-5.22 10.31C14.64 57.13 54.56 59.91 59 41c.09-.6.79-2.65 0-5zm-20.79-5.88a2.76 2.76 0 0 1-2.76-2.76c0-1.53 1.23-2.76 2.76-2.76h2.71a2.76 2.76 0 1 1 0 5.52h-2.71z"
                        />
                        <circle cx="20" cy="33" r="3" />
                        <circle
                          cx="25"
                          cy="42"
                          r="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle cx="35" cy="45" r="3" />
                        <circle cx="45" cy="44" r="3" />
                      </g>
                    </svg>
                  </div>

                  <div className="w-[60%]">
                    Your task is to select a color that, in Your opinion, best
                    matches the word on the screen.
                  </div>
                  <div className="w-[20%] h-full flex items-center justify-center">
                    <div className="">
                      {step} / {outof}
                    </div>
                  </div>
                </div>
                <Link
                  href="https://github.com/aalanso/Colormotions"
                  className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-full w-[10%] rounded-[10px] cursor-pointer transition-all ease-in-out hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2vw"
                    height="2vw"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none">
                      <path d="M0 0h24v24H0z" />
                      <path
                        fill="white"
                        d="M7.024 2.31a9.08 9.08 0 0 1 2.125 1.046A11.432 11.432 0 0 1 12 3c.993 0 1.951.124 2.849.355a9.08 9.08 0 0 1 2.124-1.045c.697-.237 1.69-.621 2.28.032c.4.444.5 1.188.571 1.756c.08.634.099 1.46-.111 2.28C20.516 7.415 21 8.652 21 10c0 2.042-1.106 3.815-2.743 5.043a9.456 9.456 0 0 1-2.59 1.356c.214.49.333 1.032.333 1.601v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-.991c-.955.117-1.756.013-2.437-.276c-.712-.302-1.208-.77-1.581-1.218c-.354-.424-.74-1.38-1.298-1.566a1 1 0 0 1 .632-1.898c.666.222 1.1.702 1.397 1.088c.48.62.87 1.43 1.63 1.753c.313.133.772.22 1.49.122L8 17.98a3.986 3.986 0 0 1 .333-1.581a9.455 9.455 0 0 1-2.59-1.356C4.106 13.815 3 12.043 3 10c0-1.346.483-2.582 1.284-3.618c-.21-.82-.192-1.648-.112-2.283l.005-.038c.073-.582.158-1.267.566-1.719c.59-.653 1.584-.268 2.28-.031Z"
                      />
                    </g>
                  </svg>
                  <div>About this</div>
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="font-['Harabara']">{`Thank You! ❤️`}</div>
            <div className="text-[3vh] font-light">
              You&apos;ve already submitted Your answer.
            </div>
            <AuthorCard />
          </div>
        )}
      </BrowserView>
      <MobileView className="w-screen h-screen flex justify-center items-center bg-white text-[5vh] text-black font-['system-ui'] animate-[opacityFadeIn_800ms_linear_1] font-medium">
        <title>Colormotions</title>
        {uiType === 1 ? (
          slide === 0 ? (
            <div className="font-['Harabara'] w-[50%] flex items-center justify-center">
              <div>Welcome to Colormotions!</div>
            </div>
          ) : slide === 1 ? (
            <div className="flex flex-col w-[70%] items-center text-[3vh] animate-[opacityFadeIn_800ms_linear_1] ">
              <div>
                Your task is to select a color that, in Your opinion, best
                matches the word on the screen.
              </div>
            </div>
          ) : slide === 3 ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="font-['Harabara']">{`Thank You! ❤️`}</div>
              <AuthorCard />
            </div>
          ) : (
            <div
              ref={cpanelRef}
              className={`w-screen h-screen flex justify-center items-center`}
            >
              <div className="w-full h-full flex  justify-center">
                <div
                  ref={emtextRef}
                  className="font-['Harabara'] text-[10vh] mt-[30vh]"
                >
                  {currentEmotion}
                </div>
              </div>

              <div className="absolute flex flex-col top-0 w-screen h-screen">
                <div className="bg-black opacity-85 flex flex-row items-center justify-between text-white text-[1.7vh] h-[13vh] w-[95%] rounded-[10px] py-[1vh] mb-[46vh] ml-[1vh] mt-[1vh]">
                  <div className="w-[20%] h-full flex items-center justify-center">
                    <svg
                      className="mx-[2vw]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="5vh"
                      height="5vh"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 72 72"
                    >
                      <g stroke-miterlimit="10" stroke-width="2">
                        <path
                          fill="#A57939"
                          d="M59 36c-.25-.75-.71-2.1-2-3c-1.56-1.08-3.63-1.01-4-1c-.76.03-1.18.16-2 0c-.58-.12-1.53-.3-2-1c-.4-.59-.15-1.08 0-3c.12-1.51.17-2.27 0-3c-.37-1.58-1.49-2.56-2-3c-1.05-.92-2.38-1.56-5-2c-1.82-.31-4.75-.6-9 0c-2.15.3-5.46.87-8 1.72c-1.77.58-3.74 1.41-6 3c-.02.01-.04.02-.05.03c-3.44 2.24-5.39 6.2-5.22 10.31C14.64 57.13 54.56 59.91 59 41c.09-.6.79-2.65 0-5zm-20.79-5.88a2.76 2.76 0 0 1-2.76-2.76c0-1.53 1.23-2.76 2.76-2.76h2.71a2.76 2.76 0 1 1 0 5.52h-2.71z"
                        />
                        <circle cx="20" cy="33" r="3" fill="#61B2E4" />
                        <circle cx="25" cy="42" r="3" fill="#5C9E31" />
                        <circle cx="35" cy="45" r="3" fill="#FCEA2B" />
                        <circle cx="45" cy="44" r="3" fill="#D22F27" />
                      </g>
                      <g
                        fill="none"
                        stroke="#000"
                        stroke-miterlimit="10"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M59 36c-.25-.75-.71-2.1-2-3c-1.56-1.08-3.63-1.01-4-1c-.76.03-1.18.16-2 0c-.58-.12-1.53-.3-2-1c-.4-.59-.15-1.08 0-3c.12-1.51.17-2.27 0-3c-.37-1.58-1.49-2.56-2-3c-1.05-.92-2.38-1.56-5-2c-1.82-.31-4.75-.6-9 0c-2.15.3-5.46.87-8 1.72c-1.77.58-3.74 1.41-6 3c-.02.01-.04.02-.05.03c-3.44 2.24-5.39 6.2-5.22 10.31C14.64 57.13 54.56 59.91 59 41c.09-.6.79-2.65 0-5zm-20.79-5.88a2.76 2.76 0 0 1-2.76-2.76c0-1.53 1.23-2.76 2.76-2.76h2.71a2.76 2.76 0 1 1 0 5.52h-2.71z"
                        />
                        <circle cx="20" cy="33" r="3" />
                        <circle
                          cx="25"
                          cy="42"
                          r="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle cx="35" cy="45" r="3" />
                        <circle cx="45" cy="44" r="3" />
                      </g>
                    </svg>
                  </div>

                  <div className="w-[60%]">
                    Your task is to select a color that, in Your opinion, best
                    matches the word on the screen.
                  </div>
                  <div className="w-[20%] h-full flex items-center justify-center">
                    <div className="">
                      {step} / {outof}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full h-min top-0 items-center justify-center  mobilepickerwrapper">
                  <HexColorPicker color={color} onChange={handleChange} />
                  <div className="flex flex-row w-full h-min my-[1vh]">
                    <Link
                      href="https://github.com/aalanso/Colormotions"
                      className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-[10vh] w-[48.5vw] rounded-[10px] ml-[1vh] mr-[0.5vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                    >
                      <svg
                        className="mr-[1vh]"
                        xmlns="http://www.w3.org/2000/svg"
                        width="2vh"
                        height="2vh"
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 24 24"
                      >
                        <g fill="none">
                          <path d="M0 0h24v24H0z" />
                          <path
                            fill="white"
                            d="M7.024 2.31a9.08 9.08 0 0 1 2.125 1.046A11.432 11.432 0 0 1 12 3c.993 0 1.951.124 2.849.355a9.08 9.08 0 0 1 2.124-1.045c.697-.237 1.69-.621 2.28.032c.4.444.5 1.188.571 1.756c.08.634.099 1.46-.111 2.28C20.516 7.415 21 8.652 21 10c0 2.042-1.106 3.815-2.743 5.043a9.456 9.456 0 0 1-2.59 1.356c.214.49.333 1.032.333 1.601v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-.991c-.955.117-1.756.013-2.437-.276c-.712-.302-1.208-.77-1.581-1.218c-.354-.424-.74-1.38-1.298-1.566a1 1 0 0 1 .632-1.898c.666.222 1.1.702 1.397 1.088c.48.62.87 1.43 1.63 1.753c.313.133.772.22 1.49.122L8 17.98a3.986 3.986 0 0 1 .333-1.581a9.455 9.455 0 0 1-2.59-1.356C4.106 13.815 3 12.043 3 10c0-1.346.483-2.582 1.284-3.618c-.21-.82-.192-1.648-.112-2.283l.005-.038c.073-.582.158-1.267.566-1.719c.59-.653 1.584-.268 2.28-.031Z"
                          />
                        </g>
                      </svg>
                      <div>About this</div>
                    </Link>
                    {step === 9 ? (
                      <div
                        onClick={() => handleFinished()}
                        className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-[10vh] w-[48.5vw] rounded-[10px] mr-[1vh] ml-[0.5vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                      >
                        <div className="">Submit</div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="3vh"
                          height="3vh"
                          preserveAspectRatio="xMidYMid meet"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="white"
                            d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleNext()}
                        className="bg-black opacity-85 flex flex-row items-center justify-center text-white text-[2vh] h-[10vh] w-[48.5vw] rounded-[10px] mr-[1vh] ml-[0.5vh] cursor-pointer transition-all ease-in-out hover:scale-105"
                      >
                        <div>Next</div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="3vh"
                          height="3vh"
                          preserveAspectRatio="xMidYMid meet"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="white"
                            d="M9.31 6.71a.996.996 0 0 0 0 1.41L13.19 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="font-['Harabara']">{`Thank You! ❤️`}</div>
            <div className="text-[2vh] font-light">
              You&apos;ve already submitted Your answer.
            </div>
            <AuthorCard />
          </div>
        )}
      </MobileView>
    </div>
  );
}
