"use client";

import { useState, useEffect } from "react";

interface GuestbookEntry {
  name: string;
  date: string;
  message: string;
}

const DEFAULT_ENTRIES: GuestbookEntry[] = [
  {
    name: "xXCoolDude99Xx",
    date: "12/25/1999",
    message: "Y2K is coming!!! Stock up on canned food and batteries! The government doesn't want you to know! Visit my site: geocities.com/area51/bunker/xXCoolDude99Xx for the TRUTH!!!"
  },
  {
    name: "SkaterGrrl4Life",
    date: "11/18/1999",
    message: "SEND THIS TO 10 PPL OR YOU WILL HAVE BAD LUCK FOR 7 YEARS!!! Britney is my queen btw. ^_^"
  },
  {
    name: "NetSurfer2000",
    date: "10/31/1999",
    message: "FREE MONEY ONLINE!!! Work from home!!! Click here -> www.priceiswrongbitch.net <- I made $5000 last week!!! This really works!!!"
  },
  {
    name: "TechWiz98",
    date: "09/15/1999",
    message: "WHOA this is like THE MATRIX! What if WE'RE in the matrix right now?!?! Email me: TechWiz98@hotmail.com to discuss THEORIES!"
  },
  {
    name: "CyberChick777",
    date: "08/08/1999",
    message: "OpenChaos 4 ever <3 <3 <3 Also my homepage is angelfire.com/cybercutie777 plz visit & sign MY guestbook too!!!! xoxo *~*~*"
  }
];

export function Guestbook() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEntries, setUserEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("guestbook-entries");
    if (stored) {
      try {
        setUserEntries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load guestbook entries", e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      alert("Please fill out both fields!");
      return;
    }

    const newEntry: GuestbookEntry = {
      name: name.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      message: message.trim()
    };

    const updated = [newEntry, ...userEntries];
    setUserEntries(updated);
    localStorage.setItem("guestbook-entries", JSON.stringify(updated));
    
    setName("");
    setMessage("");
    setShowForm(false);
    alert("✨ Thanks for signing my guestbook! ✨");
  };

  const allEntries = [...userEntries, ...DEFAULT_ENTRIES];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="guestbook-button"
      >
        <b>📝 Sign My Guestbook! 📝</b>
      </button>

      {isOpen && (
        <div className="guestbook-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="guestbook-modal" onClick={(e) => e.stopPropagation()}>
            <table width="100%" border={3} cellPadding={0} cellSpacing={0} className="guestbook-modal-table">
              <tbody>
                <tr>
                  <td className="guestbook-modal-header">
                    <span className="guestbook-modal-header-text">
                      <b><span className="sparkle-shine">✨</span> GUESTBOOK <span className="sparkle-shine sparkle-delay-2">✨</span></b>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="guestbook-modal-subheader">
                    <span className="guestbook-modal-subheader-text">
                      {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                      <marquee scrollamount="3">
                        <span className="sparkle-twinkle">🌟</span> Thanks for visiting! Please read what other visitors have said! <span className="sparkle-twinkle sparkle-delay-1">🌟</span>
                      {/* @ts-expect-error marquee is deprecated but used for retro styling */}
                      </marquee>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="guestbook-modal-content">
                    {!showForm ? (
                      <div className="guestbook-entries-container">
                        {allEntries.map((entry, index) => (
                          <table 
                            key={index} 
                            width="100%" 
                            border={2} 
                            cellPadding={8} 
                            cellSpacing={0}
                            className="guestbook-entry-table"
                          >
                            <tbody>
                              <tr>
                                <td className="guestbook-entry-header">
                                  <span className="guestbook-entry-name">
                                    <b>{entry.name}</b>
                                  </span>
                                  <span className="guestbook-entry-date">
                                    {entry.date}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="guestbook-entry-message">
                                  {entry.message}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "20px" }}>
                        <form onSubmit={handleSubmit}>
                          <table width="100%" border={2} cellPadding={10} cellSpacing={0} style={{ backgroundColor: "#ffffff" }}>
                            <tbody>
                              <tr>
                                <td style={{ backgroundColor: "#ccffcc", padding: "10px" }}>
                                  <b>Sign the Guestbook!</b>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "15px" }}>
                                  <table width="100%" border={0} cellPadding={5} cellSpacing={0}>
                                    <tbody>
                                      <tr>
                                        <td style={{ width: "120px" }}>
                                          <b>Your Name:</b>
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., @yourGitHubUsername"
                                            maxLength={50}
                                            style={{
                                              width: "100%",
                                              padding: "5px",
                                              border: "2px inset #808080",
                                              fontFamily: "'Comic Sans MS', cursive",
                                              fontSize: "14px"
                                            }}
                                          />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style={{ verticalAlign: "top", paddingTop: "10px" }}>
                                          <b>Message:</b>
                                        </td>
                                        <td>
                                          <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Leave your mark on the information superhighway!"
                                            maxLength={500}
                                            rows={5}
                                            style={{
                                              width: "100%",
                                              padding: "5px",
                                              border: "2px inset #808080",
                                              fontFamily: "'Comic Sans MS', cursive",
                                              fontSize: "14px",
                                              resize: "vertical"
                                            }}
                                          />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td colSpan={2} style={{ textAlign: "center", paddingTop: "10px" }}>
                                          <button
                                            type="submit"
                                            style={{
                                              backgroundColor: "#00ff00",
                                              color: "#0000ff",
                                              border: "3px solid #000000",
                                              padding: "8px 20px",
                                              fontFamily: "'Comic Sans MS', cursive",
                                              fontSize: "14px",
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                              marginRight: "10px"
                                            }}
                                          >
                                            ✍️ SIGN IT!
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            style={{
                                              backgroundColor: "#ff0000",
                                              color: "#ffff00",
                                              border: "3px solid #000000",
                                              padding: "8px 20px",
                                              fontFamily: "'Comic Sans MS', cursive",
                                              fontSize: "14px",
                                              cursor: "pointer",
                                              fontWeight: "bold"
                                            }}
                                          >
                                            CANCEL
                                          </button>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="guestbook-modal-footer">
                    {!showForm && (
                      <button 
                        onClick={() => setShowForm(true)}
                        style={{
                          backgroundColor: "#00ffff",
                          color: "#ff0000",
                          border: "3px solid #0000ff",
                          padding: "10px 20px",
                          fontFamily: "'Comic Sans MS', cursive",
                          fontSize: "16px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginRight: "10px"
                        }}
                      >
                        ✏️ SIGN GUESTBOOK
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        setShowForm(false);
                      }}
                      className="guestbook-close-button"
                    >
                      <b>[X] CLOSE</b>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
