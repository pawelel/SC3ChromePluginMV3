chrome.storage.sync.get(['outputTitle'], ({ outputTitle }) => {
    const selector = 'input[type="text"][name="instance/brief.description"]';

    document.querySelectorAll('iframe').forEach((iframe) => {
        (iframe.contentWindow || iframe.contentDocument)?.document?.querySelector(selector)?.value = outputTitle;
    });
});

/*
    chrome.storage.sync.get(['outputTitle'], ({ outputTitle }) => {
        var iframe = document.getElementsByTagName('iframe');
        if (iframe.length > 0) {
            for (var index in iframe) {
                if (!isNaN(index)) {
                    var specific_iframe = iframe[index].contentWindow || iframe[index].contentDocument;
                    var input = specific_iframe.document.getElementsByTagName('input');
                    var select = specific_iframe.document.getElementsByTagName('select');
                    var textarea = specific_iframe.document.getElementsByTagName('textarea');
        
                    for (var i in iframe) {
                        if (iframe[i] > 0) {
                            for (var index in input) {
                                if (input.length > 0) {
                                    if (input[index].name == 'instance/brief.description') input[index].value = value;
                                }
                            }
                        }
                    }
                }
            }
        }
    });
*/