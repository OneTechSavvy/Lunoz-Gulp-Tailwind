const colors = require('tailwindcss/colors')

module.exports = {
    content: [
        "./src/**/*.{html,js}",
        "node_modules/@frostui/tailwindcss/dist/*.js"
    ],
    darkMode: ['class', '[data-mode="dark"]'],
    theme: {

        container: {
            center: true,
        },

        fontFamily: {
            base: ['"Baloo Paaji 2"', 'cursive'],
        },

        extend: {
            colors: {
                'primary': colors.blue[500],
                'secondary': '#747a80',
                'success': '#20b799',
                'info': '#3cbade',
                'warning': '#efb540',
                'danger': '#fa5944',
                'light': '#e9edf3',
                'dark': '#222a3e',
            },
        },
    },

    plugins: [
        require('@frostui/tailwindcss/plugin'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
}