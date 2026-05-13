/**
 * AB Coach · Auth Module
 * Compatible con rutas limpias de Vercel:
 * /cliente
 * /cliente-sr
 * /admin
 * /index
 */

const Auth = (() => {
  const K_ROLE        = 'ab_role';
  const K_CLIENT_ID   = 'ab_client_id';
  const K_ADMIN_OK    = 'ab_admin_ok';
  const K_CLIENT_LANG = 'ab_client_lang';

  const PATH_INDEX     = '/';
  const PATH_CLIENT_ES = '/cliente';
  const PATH_CLIENT_SR = '/cliente-sr';
  const PATH_ADMIN     = '/admin';

  function _get(key) {
    return sessionStorage.getItem(key);
  }

  function _set(key, val) {
    sessionStorage.setItem(key, val);
  }

  function _clear() {
    sessionStorage.removeItem(K_ROLE);
    sessionStorage.removeItem(K_CLIENT_ID);
    sessionStorage.removeItem(K_ADMIN_OK);
    sessionStorage.removeItem(K_CLIENT_LANG);
  }

  function cleanPath(path) {
    return String(path || '')
      .replace(/\/index\.html$/, '/')
      .replace(/\/cliente\.html$/, '/cliente')
      .replace(/\/cliente-sr\.html$/, '/cliente-sr')
      .replace(/\/admin\.html$/, '/admin');
  }

  function getCurrentClientPath() {
    const path = cleanPath(window.location.pathname);

    if (path.includes('/cliente-sr')) {
      return PATH_CLIENT_SR;
    }

    return PATH_CLIENT_ES;
  }

  function getSavedClientPath() {
    return _get(K_CLIENT_LANG) === 'sr'
      ? PATH_CLIENT_SR
      : PATH_CLIENT_ES;
  }

  function buildUrl(path, params = {}) {
    const url = new URL(path, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    return url.pathname + url.search;
  }

  function init(expectedRole) {
    const role = _get(K_ROLE);

    if (expectedRole === 'admin') {
      if (role !== 'admin' || _get(K_ADMIN_OK) !== 'true') {
        window.location.replace(buildUrl(PATH_ADMIN, { auth: 'required' }));
        return false;
      }
    }

    if (expectedRole === 'client') {
      if (role !== 'client' || !_get(K_CLIENT_ID)) {
        window.location.replace(buildUrl(getCurrentClientPath(), { auth: 'required' }));
        return false;
      }
    }

    return true;
  }

  function loginAsClient(clientId, lang) {
    const currentPath = getCurrentClientPath();

    let finalLang = lang || _get(K_CLIENT_LANG) || 'es';

    if (currentPath === PATH_CLIENT_SR) {
      finalLang = 'sr';
    }

    const targetPath = finalLang === 'sr'
      ? PATH_CLIENT_SR
      : PATH_CLIENT_ES;

    _clear();
    _set(K_ROLE, 'client');
    _set(K_CLIENT_ID, clientId);
    _set(K_CLIENT_LANG, finalLang);

    window.location.replace(buildUrl(targetPath, { v: Date.now() }));
  }

  function loginAsAdmin() {
    _clear();
    _set(K_ROLE, 'admin');
    _set(K_ADMIN_OK, 'true');

    window.location.replace(buildUrl(PATH_ADMIN, { v: Date.now() }));
  }

  function logout() {
    const role = _get(K_ROLE);
    const clientPath = getSavedClientPath();

    _clear();

    if (role === 'admin') {
      window.location.replace(buildUrl(PATH_ADMIN, { logged_out: '1', v: Date.now() }));
    } else {
      window.location.replace(buildUrl(clientPath, { logged_out: '1', v: Date.now() }));
    }
  }

  function logoutToIndex() {
    _clear();
    window.location.replace(buildUrl(PATH_INDEX, { v: Date.now() }));
  }

  function getClientId() {
    return _get(K_CLIENT_ID);
  }

  function getClientLang() {
    return _get(K_CLIENT_LANG) || 'es';
  }

  function isAdmin() {
    return _get(K_ROLE) === 'admin' && _get(K_ADMIN_OK) === 'true';
  }

  function isClient() {
    return _get(K_ROLE) === 'client' && !!_get(K_CLIENT_ID);
  }

  return {
    init,
    loginAsClient,
    loginAsAdmin,
    logout,
    logoutToIndex,
    getClientId,
    getClientLang,
    isAdmin,
    isClient
  };
})();