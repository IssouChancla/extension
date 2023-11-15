import React, { ReactElement, useState } from "react"
import classNames from "classnames"
import SharedIcon from "../Shared/SharedIcon"

export default function WalletSubspaceLink(): ReactElement {
  const [isFullyVisible, setIsFullyVisible] = useState(false)

  return (
    <button
      type="button"
      className={classNames("subscape_link", { visible: isFullyVisible })}
      onClick={() => {
        window.open("https://app.taho.xyz/", "_blank")?.focus()
      }}
      onMouseEnter={() => setIsFullyVisible(true)}
      onMouseLeave={() => setIsFullyVisible(false)}
    >
      <SharedIcon
        icon="subscape-logo.svg"
        width={22}
        color="var(--subscape)"
        customStyles="margin-right: 10px;"
      />
      <span>Subscape Beta</span>
      <SharedIcon
        icon="new_tab@2x.png"
        width={16}
        color="var(--trophy-gold)"
        customStyles="margin-left: 5px;"
      />
      <style jsx>{`
        .subscape_link {
          cursor: pointer;
          position: absolute;
          z-index: 998; // Above the UI, below the menu
          right: 0;
          top: 90;
          transform: translateX(160px);
          transition: transform 0.3s ease-in-out;
          padding: 5px 10px 5px 5px;
          border-radius: 16px 0 0 16px;
          display: flex;
          align-items: center;
          color: var(--trophy-gold);
          font-size: 18px;
          font-weight: 600;
          background: var(--subscape-background);
          box-shadow:
            0px 10px 12px 0px rgba(7, 17, 17, 0.34),
            0px 14px 16px 0px rgba(7, 17, 17, 0.24),
            0px 24px 24px 0px rgba(7, 17, 17, 0.14);
        }
        .subscape_link.visible {
          transform: translateX(0px);
        }
      `}</style>
    </button>
  )
}
