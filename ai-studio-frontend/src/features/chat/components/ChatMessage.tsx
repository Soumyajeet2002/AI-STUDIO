// // import {
// //     Bot,
// //     User,
// // } from "lucide-react";

// import type {
//     ChatMessage as ChatMessageType,
// } from "../types/chat.types";

// import "./ChatMessage.css";

// type ChatMessageProps = {
//     message: ChatMessageType;
// };

// export function ChatMessage({
//     message,
// }: ChatMessageProps) {
//     const isUser =
//         message.role === "user";

//     const isAssistant =
//         message.role === "assistant";

//     if (
//         !isUser &&
//         !isAssistant
//     ) {
//         return null;
//     }

//     return (
//         <article
//             className={`chat-message ${isUser
//                 ? "chat-message--user"
//                 : "chat-message--assistant"
//                 }`}
//         >
//             <div className="chat-message__content">
//                 {/* <div className="chat-message__header">
//                     <div className="chat-message__identity">
//                         <div className="chat-message__avatar">
//                             {isUser ? (
//                                 <User size={15} />
//                             ) : (
//                                 <Bot size={15} />
//                             )}
//                         </div>

//                         <span className="chat-message__role">
//                             {isUser
//                                 ? "You"
//                                 : "AI Studio"}
//                         </span>
//                     </div>

//                     {message.metadata
//                         ?.executionStatus ===
//                         "completed" ? (
//                         <span className="chat-message__status">
//                             Completed
//                         </span>
//                     ) : null}
//                 </div> */}

//                 <div className="chat-message__body">
//                     {message.content}
//                 </div>
//             </div>
//         </article>
//     );
// }


import type {
    WorkspaceMessage,
} from "../types/chat.types";

import "./ChatMessage.css";

type ChatMessageProps = {
    message: WorkspaceMessage;
};

export function ChatMessage({
    message,
}: ChatMessageProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";

    if (!isUser && !isAssistant) {
        return null;
    }

    return (
        <article
            className={`chat - message ${isUser
                    ? "chat-message--user"
                    : "chat-message--assistant"
                } `}
        >
            <div className="chat-message__content">
                <div className="chat-message__body">
                    {message.content}
                </div>
            </div>
        </article>
    );
}