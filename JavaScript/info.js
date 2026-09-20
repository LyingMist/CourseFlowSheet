document.addEventListener('DOMContentLoaded', initializeInfoModal);

function initializeInfoModal() {
    const openButton = document.getElementById('info-button');
    const overlay = document.getElementById('info-modal');
    const dialog = overlay?.querySelector('.info-dialog');
    const closeButton = document.getElementById('info-close-button');
    const tabs = Array.from(document.querySelectorAll('[data-info-topic]'));
    const panels = Array.from(document.querySelectorAll('[data-info-panel]'));
    const backgroundElements = [
        document.querySelector('.page-header'),
        document.getElementById('flowsheet-root')
    ].filter(Boolean);
    let previouslyFocusedElement = null;

    if (!openButton || !overlay || !dialog || !closeButton) {
        return;
    }

    function activateTopic(selectedTab, moveFocus = false) {
        const selectedTopic = selectedTab.dataset.infoTopic;

        tabs.forEach(tab => {
            const isSelected = tab === selectedTab;
            tab.classList.toggle('active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;
        });

        panels.forEach(panel => {
            panel.hidden = panel.dataset.infoPanel !== selectedTopic;
        });

        if (moveFocus) {
            selectedTab.focus();
        }
    }

    function openModal() {
        previouslyFocusedElement = document.activeElement;
        overlay.hidden = false;
        document.body.classList.add('modal-open');
        openButton.setAttribute('aria-expanded', 'true');
        backgroundElements.forEach(element => {
            element.inert = true;
        });
        dialog.focus();
    }

    function closeModal() {
        overlay.hidden = true;
        document.body.classList.remove('modal-open');
        openButton.setAttribute('aria-expanded', 'false');
        backgroundElements.forEach(element => {
            element.inert = false;
        });

        if (previouslyFocusedElement instanceof HTMLElement) {
            previouslyFocusedElement.focus();
        } else {
            openButton.focus();
        }
    }

    function getFocusableElements() {
        return Array.from(
            dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter(element => !element.disabled && element.tabIndex >= 0 && !element.closest('[hidden]'));
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    overlay.addEventListener('click', event => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    tabs.forEach((tab, tabIndex) => {
        tab.addEventListener('click', () => {
            activateTopic(tab);
        });

        tab.addEventListener('keydown', event => {
            let nextIndex = tabIndex;

            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                nextIndex = (tabIndex + 1) % tabs.length;
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = tabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            activateTopic(tabs[nextIndex], true);
        });
    });

    document.addEventListener('keydown', event => {
        if (overlay.hidden) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const focusableElements = getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) {
            event.preventDefault();
            dialog.focus();
        } else if (document.activeElement === dialog) {
            event.preventDefault();
            (event.shiftKey ? lastElement : firstElement).focus();
        } else if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
}
