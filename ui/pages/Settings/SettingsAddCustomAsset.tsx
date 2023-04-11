import {
  isProbablyEVMAddress,
  normalizeEVMAddress,
} from "@tallyho/tally-background/lib/utils"
import {
  checkTokenContractDetails,
  importTokenViaContractAddress,
} from "@tallyho/tally-background/redux-slices/assets"
import { selectCurrentNetwork } from "@tallyho/tally-background/redux-slices/selectors"
import { setSnackbarMessage } from "@tallyho/tally-background/redux-slices/ui"
import { AsyncThunkFulfillmentType } from "@tallyho/tally-background/redux-slices/utils"
import { HexString } from "@tallyho/tally-background/types"
import React, { FormEventHandler, ReactElement, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useHistory } from "react-router-dom"
import SharedAssetIcon from "../../components/Shared/SharedAssetIcon"
import SharedButton from "../../components/Shared/SharedButton"
import SharedIcon from "../../components/Shared/SharedIcon"
import SharedInput from "../../components/Shared/SharedInput"
import SharedLink from "../../components/Shared/SharedLink"
import SharedPageHeader from "../../components/Shared/SharedPageHeader"
import SharedTooltip from "../../components/Shared/SharedTooltip"
import { useBackgroundDispatch, useBackgroundSelector } from "../../hooks"
import { useSetState } from "../../hooks/react-hooks"

const HELPDESK_CUSTOM_TOKENS_LINK =
  "https://tahowallet.notion.site/Adding-Custom-Tokens-2facd9b82b5f4685a7d4766caeb05a4c"

const PlaceholderIcon = () => (
  <div>
    <i />
    <style jsx>{`
      i {
        mask-image: url("/images/placeholder.svg");
        mask-size: cover;
        display: block;
        width: 24px;
        height: 24px;
        background-color: var(--green-20);
      }
      div {
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--green-60);
        width: 40px;
        color: var(--green-20);
      }
    `}</style>
  </div>
)

export default function SettingsAddCustomAsset(): ReactElement {
  const { t } = useTranslation("translation", {
    keyPrefix: "settings.addCustomAssetSettings",
  })

  const history = useHistory()

  type AssetData = AsyncThunkFulfillmentType<typeof checkTokenContractDetails>

  const [{ loading, error, assetData }, setState] = useSetState<{
    loading: boolean
    error: boolean
    assetData: AssetData | null
  }>({
    loading: false,
    error: false,
    assetData: null,
  })

  const dispatch = useBackgroundDispatch()
  const currentNetwork = useBackgroundSelector(selectCurrentNetwork)

  const requestIdRef = useRef(0)

  const handleContractChange = async (addressLike: HexString) => {
    requestIdRef.current += 1
    const callId = requestIdRef.current

    const contractAddress = addressLike.trim()

    if (contractAddress.length < 1) {
      setState({ loading: false, assetData: null, error: false })
      return
    }

    if (!isProbablyEVMAddress(contractAddress)) {
      setState({ loading: false, assetData: null, error: true })
      return
    }

    const details = (await dispatch(
      checkTokenContractDetails({
        contractAddress: normalizeEVMAddress(contractAddress),
      })
    )) as unknown as AssetData

    // async setState safeguard
    if (requestIdRef.current === callId) {
      setState({ loading: false, assetData: details, error: details === null })
    }
  }

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!assetData) {
      return
    }

    await dispatch(
      importTokenViaContractAddress({
        contractAddress: assetData.asset.contractAddress,
        network: assetData.asset.homeNetwork,
      })
    )
    await dispatch(setSnackbarMessage(t("snackbar.success")))
    history.push("/")
  }

  return (
    <div className="standard_width_padded wrapper">
      <SharedPageHeader withoutBackText backPath="/settings">
        {t(`title`)}
      </SharedPageHeader>
      <style jsx>{`
        .tooltip_wrap {
          position: absolute;
          top: 16px;
          right: 16px;
        }

        .tooltip_wrap a {
          color: inherit;
          text-decoration: underline;
        }

        .input_container {
          position: relative;
          --input-padding: 0 32px 0 16px;
        }
      `}</style>
      <form onSubmit={handleFormSubmit}>
        <div className="input_container">
          <SharedInput
            label={t("input.contractAddress.label")}
            errorMessage={error ? t("error.invalidToken") : ""}
            onChange={handleContractChange}
          />
          <div className="tooltip_wrap">
            <SharedTooltip
              width={219}
              horizontalShift={100}
              customStyles={{ "--tooltip-icon-color": "var(--green-20)" }}
            >
              <Trans
                t={t}
                i18nKey="input.tooltip"
                components={{
                  url: <SharedLink url={HELPDESK_CUSTOM_TOKENS_LINK} />,
                }}
              />
            </SharedTooltip>
          </div>
        </div>
        <div className="form_controls">
          <div className="token_details_container">
            {assetData && !loading ? (
              <SharedAssetIcon
                size={40}
                logoURL={assetData?.asset.metadata?.logoURL}
                symbol={assetData.asset.symbol}
              />
            ) : (
              <PlaceholderIcon />
            )}
            <div className="token_details">
              <div className="balance">
                <strong>{assetData?.balance ?? "Balance"}</strong>
                <span className="symbol">
                  {assetData?.asset?.symbol ?? "Name"}
                </span>
              </div>
              <span className="network_name">{currentNetwork.name}</span>
            </div>
          </div>
          <SharedButton
            type="primary"
            size="medium"
            isFormSubmit
            isDisabled={!assetData || loading || error || assetData.exists}
            isLoading={loading}
          >
            {t("submit")}
          </SharedButton>
        </div>
        {assetData?.exists && (
          <div className="alert">
            <SharedIcon
              color="var(--success)"
              width={24}
              customStyles="min-width: 24px;"
              icon="icons/m/notif-correct.svg"
            />
            <div className="alert_content">
              <div className="title">{t("warning.alreadyExists.title")}</div>
              <div className="desc">{t("warning.alreadyExists.desc")}</div>
            </div>
          </div>
        )}
      </form>
      <style jsx>{`
        .alert {
          background: var(--green-120);
          border-radius: 8px;
          padding: 8px;
          display: flex;
          gap: 8px;
        }

        .alert .title {
          color: var(--success);
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          letter-spacing: 0em;
          text-align: left;
        }

        .alert .desc {
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          letter-spacing: 0em;
          text-align: left;
          color: var(--green-40);
        }
      `}</style>
      <footer>
        <SharedLink
          text={t("footer.hint")}
          url={HELPDESK_CUSTOM_TOKENS_LINK}
          styles={{ "--link-color": "var(--green-40)" }}
        />
      </footer>
      <style jsx>{`
        form {
          all: unset;
          max-width: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .form_controls {
          display: flex;
          justify-content: space-between;
        }

        .network_name {
          font-size: 14px;
          font-weight: 500;
          line-height: 16px;
          letter-spacing: 0.03em;
          text-align: left;
          color: var(--green-40);
        }

        .token_details_container {
          display: flex;
          gap: 16px;
        }

        .token_details {
          display: flex;
          flex-direction: column;
        }

        .balance {
          display: flex;
          gap: 4px;
          align-items: baseline;
        }

        .balance strong {
          font-style: normal;
          font-weight: 600;
          font-size: 18px;
          line-height: 24px;
          color: var(--white);
        }

        .symbol {
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 16px;
          letter-spacing: 0.03em;
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
          height: 100%;
          margin-bottom: 24px;
        }

        footer {
          margin-top: auto;
          font-style: normal;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
      `}</style>
    </div>
  )
}
