window.fromWPS = {
  isEditMode: '[Plugin:PageMode pageMode="EDIT"]Edit mode is ON[/Plugin:PageMode]',
  parentTitle: '[Property context="current" type="parent" field="title"]',
  userId: '[Plugin:EvaluateEL value="${wp.user.uid}"][/Plugin:EvaluateEL]',
  thisAuthor: '[Property context="current" type="auto" format="cn" field="authors"]',
  thisTitle: '[Property context="current" type="auto" field="title"]',
  displayName: `[Plugin:EvaluateEL value="${wp.user[wp.themeConfig['user.displaynameattribute']]}"]`,
  firstName: '[Plugin:EvaluateEL value="${wp.user.cn}"]',
  lastName: '[Plugin:EvaluateEL value="${wp.user.sn}"]',
};

// const items = document.querySelectorAll("htmlwrapper[need-to-remove-style='true']");
// const items = document.querySelectorAll("htmlwrapper[name='need-to-un-hide']");
const items = document.querySelectorAll("htmlwrapper");
// console.info(`items`);
for(let i = 0; i < items.length; i++) {
  const item = items[i];
  // only un-hide the hidden one
  if(item.style.display === 'none') {
    console.debug(`Will un-hide this htmlwrapper:`);
    console.debug(`item`);
    item.style.display = '';
  }
  // item.setAttribute('style', '');
};

