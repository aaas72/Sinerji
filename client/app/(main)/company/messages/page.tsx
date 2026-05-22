"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FiMessageSquare, FiSend, FiSearch, FiMoreVertical, FiPaperclip, FiCheck, FiCornerUpLeft, FiCopy, FiTrash2, FiArrowDown } from "react-icons/fi";

const MOCK_CONTACTS = [
  { id: 1, name: "Ahmet Yılmaz", role: "Frontend Developer Stajyeri", time: "10:45", unread: 2, initials: "AY" },
  { id: 2, name: "Ayşe Kaya", role: "Grafik Tasarım Projesi", time: "Dün", unread: 0, initials: "AK" },
  { id: 3, name: "Mehmet Demir", role: "Sosyal Medya Uzmanı", time: "Pzt", unread: 0, initials: "MD" },
];

const MOCK_MESSAGES = [
  { id: 1, sender: "Ahmet Yılmaz", text: "Merhaba, mülakat için hangi saat uygun olur?", time: "10:30", date: "Bugün", isMe: false, status: "read" },
  { id: 2, sender: "Ben", text: "Merhaba Ahmet, yarın öğleden sonra 14:00 uygun mudur?", time: "10:40", date: "Bugün", isMe: true, status: "read" },
  { id: 3, sender: "Ahmet Yılmaz", text: "Evet, çok uygun. Teşekkür ederim.", time: "10:45", date: "Bugün", isMe: false, status: "read" },
];

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState<(typeof MOCK_CONTACTS)[0] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  let lastDate = "";

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 h-[calc(100vh-80px)] flex flex-col">


      {/* Main Chat Container */}
      <div className="flex-1 min-h-0 flex bg-transparent rounded-3xl border border-[#DFDED6] overflow-hidden">
        
        {/* Left Sidebar (Contacts) */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0 hidden md:flex border-r border-[#DFDED6] bg-white">
          <div className="p-5 border-b border-[#DFDED6]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Kişi Ara..." 
                className="pl-9 pr-4 py-2.5 rounded-[50px] bg-gray-50 border border-transparent text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {MOCK_CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-colors border-b border-[#DFDED6] last:border-0 ${
                  activeContact?.id === contact.id ? "bg-[#F1F0EA]/50" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {contact.initials}
                  </div>
                  {contact.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00342b] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {contact.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm font-bold truncate ${activeContact?.id === contact.id ? "text-[#0b1c30]" : "text-gray-800"}`}>
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium shrink-0">{contact.time}</span>
                  </div>
                  <p className="text-xs text-[#e28743] font-medium truncate">{contact.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-[#DFDED6] flex items-center justify-between px-6 shrink-0 bg-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {activeContact.initials}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0b1c30]">{activeContact.name}</h2>
                  </div>
                </div>
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                  <FiMoreVertical size={20} />
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-transparent custom-scrollbar">
                {MOCK_MESSAGES.map((msg) => {
                  const showDate = msg.date !== lastDate;
                  if (showDate) lastDate = msg.date;

                  return (
                    <div key={msg.id} className="flex flex-col gap-4">
                      {showDate && (
                        <div className="flex justify-center my-2">
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {msg.date}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex max-w-[80%] group ${msg.isMe ? "self-end" : "self-start"}`}>
                        
                        {/* Hover Actions (Sent) */}
                        {msg.isMe && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" title="Yanıtla"><FiCornerUpLeft size={14} /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" title="Kopyala"><FiCopy size={14} /></button>
                            <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Sil"><FiTrash2 size={14} /></button>
                          </div>
                        )}

                        <div className={`p-4 rounded-3xl relative ${
                          msg.isMe 
                            ? "bg-[#004d40] text-white rounded-br-sm" 
                            : "bg-white border border-[#DFDED6] text-gray-800 rounded-bl-sm"
                        }`}>
                          <p className="text-sm font-medium">{msg.text}</p>
                          <div className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${msg.isMe ? "text-white/70" : "text-gray-400"}`}>
                            <span>{msg.time}</span>
                          </div>
                        </div>

                        {/* Hover Actions (Received) */}
                        {!msg.isMe && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" title="Yanıtla"><FiCornerUpLeft size={14} /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" title="Kopyala"><FiCopy size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}


                
              </div>

              {/* Scroll to bottom button */}
              <button className="absolute bottom-[90px] right-8 w-10 h-10 bg-white shadow-md border border-[#DFDED6] rounded-full flex items-center justify-center text-gray-500 hover:text-[#00342b] hover:border-[#00342b] transition-all z-10">
                <FiArrowDown size={18} />
              </button>

              {/* Input Area */}
              <div className="p-4 border-t border-[#DFDED6] bg-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <button className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shrink-0">
                    <FiPaperclip size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Bir mesaj yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 h-12 px-5 rounded-[50px] bg-white border border-[#DFDED6] text-sm focus:border-[#00342b] focus:ring-1 focus:ring-[#00342b] outline-none transition-all"
                  />
                  <Button variant="primary" className="h-12 w-12 rounded-xl flex items-center justify-center p-0 shrink-0 bg-[#00342b] hover:bg-[#002620] border-none text-white">
                    <FiSend size={18} className="ml-0.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent text-gray-400">
              <div className="w-20 h-20 bg-white border border-[#DFDED6] rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Mesajlarınızı Görüntüleyin</h3>
              <p className="text-sm text-center max-w-sm">
                Sohbeti başlatmak veya mevcut mesajları görmek için sol taraftan bir kişi seçin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
