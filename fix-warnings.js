const fs = require('fs');
const files = [
    'src/components/ui/badge.tsx',
    'src/components/ui/button.tsx',
    'src/components/ui/form.tsx',
    'src/components/ui/navigation-menu.tsx',
    'src/components/ui/sidebar.tsx',
    'src/components/ui/sonner.tsx',
    'src/components/ui/toggle.tsx',
    'src/context/QuizContext.tsx',
];
files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (!content.includes('eslint-disable react-refresh/only-export-components')) {
        fs.writeFileSync(f, '/* eslint-disable react-refresh/only-export-components */\n' + content);
    }
});
