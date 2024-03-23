
var downloadRedListCounter = 0;

export function downloadRedList(onResponse) {

    downloadRedListCounter++;

    const symbols = [];
    for (let i=0; i<downloadRedListCounter; i++) {
        symbols.push('' + i);
    }

    const response = {
        symbols: symbols
    };

    onResponse(response);
}
