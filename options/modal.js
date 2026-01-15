const button = document.getElementById('dropdown-button');
const popover = document.getElementById('dropdown-menu');

popover.addEventListener('toggle', (e) => {
    button.classList.toggle('rounded-b-none')

    if (e.newState === 'open') {
        const rect = button.getBoundingClientRect();
        
        popover.style.top = `${rect.bottom}px`;
        popover.style.left = `${rect.left}px`;
    }
});