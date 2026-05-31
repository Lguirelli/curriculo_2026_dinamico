

function openDesktopItem(item){
  if(!item) return;

  if(item.type === 'html-app' || item.type === 'exe-app'){
    openHtmlApp(item);
    return;
  }

  if(item.type === 'folder'){
    openFolder(item);
    return;
  }

  if(item.type === 'txt'){
    openTextFile(item);
    return;
  }

  if(item.type === 'game'){
    openGameWindow(item.id, item.label);
  }
}
