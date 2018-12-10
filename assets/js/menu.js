const Menu = [
  { header: 'Pedagy Admin Main' },
  {
    title: '메인',
    group: 'main',
    icon: 'dashboard',
    name: 'index',
  },
  { header: '회원' },
  {
    title: '회원 관리',
    group: 'user',
    icon: 'person',
    name: 'user',
  },
  {
    title: '그룹 관리',
    group: 'user',
    icon: 'group',
    name: 'group',
  },
  {
    title: '회원 제재 관리',
    group: 'user',
    icon: 'warning',
    name: 'declare',
  },
  { header: '게시판' },
  {
    title: '게시판 관리',
    group: 'board',
    icon: 'folder',
    name: 'board'
  },
  {
    title: '신고종류 관리',
    group: 'board',
    icon: 'flag',
    name: 'reportType'
  },
  {
    title: '게시물 신고 관리',
    group: 'board',
    icon: 'report',
    name: 'report'
  },
  {
    title: '회원 게시물 조회',
    group: 'board',
    icon: 'folder_shared',
    name: 'userDocument'
  },
  {
    title: '동물명 관리',
    group: 'board',
    icon: 'style',
    name: 'animal'
  },
  { header: '기타' },
  {
    title: '회원 알림 관리',
    group: 'etc',
    icon: 'notifications_active',
    name: 'notification'
  },
];
// reorder menu
Menu.forEach((item) => {
  if (item.items) {
    item.items.sort((x, y) => {
      let textA = x.title.toUpperCase();
      let textB = y.title.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
  }
});

export default Menu;