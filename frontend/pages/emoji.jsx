import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const EmojiPickerComponent = () => {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emoji) => {
    setText(prev => prev + emoji.native); // 'native' is the actual emoji char
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <textarea
        rows="4"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something..."
        style={{ width: "300px", padding: "10px", fontSize: "16px" }}
      />
      <br />
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{ marginTop: "10px", padding: "5px 10px" }}
      >
        {showPicker ? "Hide Emoji Picker" : "Add Emoji 😊"}
      </button>

      {showPicker && (
        <div style={{ position: "absolute", zIndex: 10, marginTop: "10px" }}>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;
