chrome.storage.sync.get(['outputTitle'], ({ outputTitle }) => {
    const titleSelector = 'input[type="text"][name="instance/brief.description"]';

    document.querySelectorAll('iframe').forEach((iframe) => {
        function trySearch(selector, callback) {
            const element = (iframe.contentWindow || iframe.contentDocument)?.document?.querySelector(selector);
            if (element) {
                callback(element);
            }
        }

        trySearch(titleSelector, (ele) => {
            ele.value = outputTitle;
            ele.focus();
        });
    });
});