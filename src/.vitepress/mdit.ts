/* eslint-disable @typescript-eslint/no-explicit-any */
const embedRE = /@\[([\w-]+)\]\(([\s\S]+)\)(.*)/im

export type CustomBlockOptions = Record<string, (arg: string, attrs: string) => string>

// Fork from
const customBlock = (md: any, options: CustomBlockOptions = {}): void => {
  // Renderer for our custom token
  // eslint-disable-next-line no-param-reassign
  md.renderer.rules.custom = function tokenizeBlock(tokens: any[], idx: number, _: any, __: any, slf: any): string {
    const meta = (tokens[idx].meta || {}) as { tag?: string; arg?: string }
    const tag = meta.tag ?? ''
    const arg = meta.arg ?? ''
    if (!tag) return ''
    const render = options[tag]
    return (render ? render(arg, slf.renderAttrs(tokens[idx]) ?? '') : '') + '\n'
  }

  md.block.ruler.before(
    'fence',
    'custom',
    function customEmbed(state: any, startLine: number, endLine: number, silent: boolean): boolean {
      const startPos = state.bMarks[startLine] + state.tShift[startLine]
      const maxPos = state.eMarks[startLine]
      const block = state.src.slice(startPos, maxPos)
      const pointer: { line: number; pos: number } = { line: startLine, pos: startPos }

      // Ensure previous line is blank (so this is a standalone block)
      if (startLine !== 0) {
        const prevLineStartPos = state.bMarks[startLine - 1] + state.tShift[startLine - 1]
        const prevLineMaxPos = state.eMarks[startLine - 1]
        if (prevLineMaxPos > prevLineStartPos) return false
      }

      // Check if it's @[tag](arg)
      if (
        state.src.charCodeAt(pointer.pos) !== 0x40 /* @ */ ||
        state.src.charCodeAt(pointer.pos + 1) !== 0x5b /* [ */
      ) {
        return false
      }

      const match = embedRE.exec(block)

      if (!match || match.length < 3) {
        return false
      }

      const [all, tag, arg, info] = match

      pointer.pos += all.length

      // Block embed must be at end of input or the next line must be blank.
      // TODO: something can be done here to make it work without blank lines
      if (endLine !== pointer.line + 1) {
        const nextLineStartPos = state.bMarks[pointer.line + 1] + state.tShift[pointer.line + 1]
        const nextLineMaxPos = state.eMarks[pointer.line + 1]
        if (nextLineMaxPos > nextLineStartPos) return false
      }

      if (pointer.line >= endLine) return false

      if (!silent) {
        const token = state.push('custom', 'div', 0)
        token.markup = state.src.slice(startPos, pointer.pos)
        token.meta = { arg, tag }
        token.block = true
        token.info = `${tag} ${info}`.trim()
        token.map = [startLine, pointer.line + 1]
        // eslint-disable-next-line no-param-reassign
        state.line = pointer.line + 1
      }

      return true
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  )
}

export default customBlock
