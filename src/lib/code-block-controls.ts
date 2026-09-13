const storageKey = "code-wrap"
let wrapped = document.documentElement.dataset.codeWrap !== "false"

function applyWrap(value: boolean) {
  wrapped = value
  document.documentElement.dataset.codeWrap = String(value)
  document.querySelectorAll<HTMLButtonElement>("button[data-code-wrap]").forEach((button) => {
    button.setAttribute("aria-pressed", String(value))
    button.title = `${value ? "Disable" : "Enable"} line wrapping in all code blocks`
  })
}

const template = document.querySelector<HTMLTemplateElement>("#code-block-toolbar")
if (template) {
  document.querySelectorAll<HTMLPreElement>(".typeset pre").forEach((pre) => {
    const code = pre.querySelector("code")
    if (!code || pre.closest(".code-block, .not-typeset, [data-not-typeset]")) return

    const wrapper = document.createElement("div")
    wrapper.className = "code-block"
    pre.before(wrapper)
    wrapper.append(pre, template.content.cloneNode(true))

    const wrapButton = wrapper.querySelector<HTMLButtonElement>("[data-code-wrap]")!
    const copyButton = wrapper.querySelector<HTMLButtonElement>("[data-code-copy]")!
    const copyIcon = wrapper.querySelector<HTMLElement>("[data-copy-icon]")!
    const copiedIcon = wrapper.querySelector<HTMLElement>("[data-copied-icon]")!
    const status = wrapper.querySelector<HTMLElement>("[data-copy-status]")!
    let resetTimer: ReturnType<typeof setTimeout> | undefined

    wrapButton.addEventListener("click", () => {
      applyWrap(!wrapped)
      try {
        localStorage.setItem(storageKey, String(wrapped))
      } catch {
        // The toggle still works when storage is unavailable.
      }
    })

    copyButton.addEventListener("click", async () => {
      clearTimeout(resetTimer)
      status.textContent = ""
      copyButton.disabled = true
      try {
        await navigator.clipboard.writeText(code.textContent ?? "")
        copyIcon.hidden = true
        copiedIcon.hidden = false
        copyButton.title = "Copied!"
        status.textContent = "Code copied to clipboard."
      } catch {
        copyIcon.hidden = false
        copiedIcon.hidden = true
        copyButton.title = "Copy failed — try again"
        status.textContent = "Could not copy code. Select the code and copy it manually."
      } finally {
        copyButton.disabled = false
        resetTimer = setTimeout(() => {
          copyIcon.hidden = false
          copiedIcon.hidden = true
          copyButton.title = "Copy code"
          status.textContent = ""
        }, 2500)
      }
    })
  })
}

applyWrap(wrapped)
window.addEventListener("storage", (event) => {
  if (event.key === storageKey || event.key === null) {
    applyWrap(event.newValue !== "false")
  }
})
