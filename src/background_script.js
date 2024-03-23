function openDashboardHandleClick() {
    browser.tabs.create({url: "dashboard/dashboard.html"});
}

browser.browserAction.onClicked.addListener(openDashboardHandleClick);

console.log('background script loaded')
