export const generateChars = (length: number) => {
    const emojis = ['😎', '🦩', '🔢', '🖥️', '🔐', '🔑', '🏝️', '🤑']
    const matrixChars = '@#%^&*?0123456789xyzXYZ'
    return Array.from({ length }, () => {
        const isEmoji = Math.random() < 0.3
        return isEmoji
            ? emojis[Math.floor(Math.random() * emojis.length)]
            : matrixChars[Math.floor(Math.random() * matrixChars.length)]
    }).join('')
}
