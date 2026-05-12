/**
 * AB Coach · Auth Module
 * Shared across index.html, cliente.html, cliente-sr.html, admin.html
 */

const Auth = (() => {
  const K_ROLE      = 'ab_role';
  const K_CLIENT_ID = 'ab_client_id';
  const K_ADMIN_OK  = 'ab_admin_ok';
  const K_CLIENT_PATH = 'ab_client_path';

  const PATH_INDEX  = '/index.html';
  const PATH_CLIENT = '/cliente.html';
  const PATH_ADMIN  = '/admin.html';

  function _get(key)      { return sessionStorage.getItem(key); }
  function _set(key, val) { sessionStorage.setItem(key, val); }

  function _clear() {
    sessionStorage.removeItem(K_ROLE);
    sessionStorage.removeItem(K_CLIENT_ID);
    sessionStorage.removeItem(K_ADMIN_OK);
    sessionStorage.removeItem(K_CLIENT_PATH);
  }

  function _currentClientPath() {
    const path = window.location.pathname;

    if (path.endsWith('/cliente-sr.html')) return '/cliente-sr.html';
    if (path.endsWith('/cliente.html')) return '/cliente.html';

    return _get(K_CLIENT_PATH) || PATH_CLIENT;
  }

  function _savedClientPath() {
    return _get(K_CLIENT_PATH) || PATH_CLIENT;
  }

  function init(expectedRole) {
    const role = _get(K_ROLE);

    if (expectedRole === 'admin') {
      if (role !== 'admin' || _get(K_ADMIN_OK) !== 'true') {
        window.location.replace(PATH_ADMIN + '?auth=required');
        return false;
      }
    }

    if (expectedRole === 'client') {
      const clientPath = _currentClientPath();
      _set(K_CLIENT_PATH, clientPath);

      if (role !== 'client' || !_get(K_CLIENT_ID)) {
        window.location.replace(clientPath + '?auth=required');
        return false;
      }
    }

    return true;
  }

  function loginAsClient(clientId) {
    const clientPath = _currentClientPath();

    _clear();
    _set(K_ROLE, 'client');
    _set(K_CLIENT_ID, clientId);
    _set(K_CLIENT_PATH, clientPath);

    window.location.replace(clientPath);
  }

  function loginAsAdmin() {
    _clear();
    _set(K_ROLE, 'admin');
    _set(K_ADMIN_OK, 'true');

    window.location.replace(PATH_ADMIN);
  }

  function logout() {
    const role = _get(K_ROLE);
    const clientPath = _savedClientPath();

    _clear();

    if (role === 'admin') {
      window.location.replace(PATH_ADMIN + '?logged_out=1');
    } else {
      window.location.replace(clientPath + '?logged_out=1');
    }
  }

  function logoutToIndex() {
    _clear();
    window.location.replace(PATH_INDEX);
  }

  function getClientId() {
    return _get(K_CLIENT_ID);
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
    isAdmin,
    isClient
  };
})();