/**
 * AB Coach · Auth Module
 * ─────────────────────────────────────────────────────────
 * Shared across index.html, cliente.html, admin.html
 *
 * ROLES
 *   admin   → puede acceder a /admin.html
 *   client  → puede acceder a /cliente.html
 *
 * SESSION STORAGE  (sessionStorage, se borra al cerrar pestaña)
 *   ab_role      : 'admin' | 'client'
 *   ab_client_id : UUID del cliente (solo para role=client)
 *   ab_admin_ok  : 'true' (solo para role=admin)
 *
 * FUNCIONES PÚBLICAS
 *   Auth.init(expectedRole)          → llama en cada página protegida
 *   Auth.loginAsClient(id)           → guarda sesión cliente y redirige
 *   Auth.loginAsAdmin()              → guarda sesión admin y redirige
 *   Auth.logout()                    → limpia sesión y redirige a index
 *   Auth.getClientId()               → devuelve UUID del cliente activo
 *   Auth.isAdmin()                   → boolean
 *   Auth.isClient()                  → boolean
 * ─────────────────────────────────────────────────────────
 */

const Auth = (() => {
  const K_ROLE      = 'ab_role';
  const K_CLIENT_ID = 'ab_client_id';
  const K_ADMIN_OK  = 'ab_admin_ok';

  // ── paths (ajusta si cambias los nombres de archivo)
  const PATH_INDEX  = '/index.html';
  const PATH_CLIENT = '/cliente.html';
  const PATH_ADMIN  = '/admin.html';

  function _get(key)      { return sessionStorage.getItem(key); }
  function _set(key, val) { sessionStorage.setItem(key, val); }
  function _clear()       {
    sessionStorage.removeItem(K_ROLE);
    sessionStorage.removeItem(K_CLIENT_ID);
    sessionStorage.removeItem(K_ADMIN_OK);
  }

  /**
   * Llama esto al inicio de cada página PROTEGIDA.
   * expectedRole: 'admin' | 'client'
   * Si la sesión no existe o el rol no coincide → redirige al login correcto.
   */
  function init(expectedRole) {
    const role = _get(K_ROLE);

    if (expectedRole === 'admin') {
      if (role !== 'admin' || _get(K_ADMIN_OK) !== 'true') {
        // Sin sesión de admin → login admin (mismo archivo, sección login)
        window.location.replace(PATH_ADMIN + '?auth=required');
        return false;
      }
    }

    if (expectedRole === 'client') {
      if (role !== 'client' || !_get(K_CLIENT_ID)) {
        window.location.replace(PATH_CLIENT + '?auth=required');
        return false;
      }
    }

    return true; // sesión válida
  }

  function loginAsClient(clientId) {
    _clear();
    _set(K_ROLE, 'client');
    _set(K_CLIENT_ID, clientId);
    // redirige limpiando el ?auth=required de la URL
    window.location.replace(PATH_CLIENT);
  }

  function loginAsAdmin() {
    _clear();
    _set(K_ROLE, 'admin');
    _set(K_ADMIN_OK, 'true');
    window.location.replace(PATH_ADMIN);
  }

  function logout() {
    const role = _get(K_ROLE);
    _clear();
    // lleva al login correspondiente
    if (role === 'admin') window.location.replace(PATH_ADMIN + '?logged_out=1');
    else                  window.location.replace(PATH_CLIENT + '?logged_out=1');
  }

  function logoutToIndex() {
    _clear();
    window.location.replace(PATH_INDEX);
  }

  function getClientId() { return _get(K_CLIENT_ID); }
  function isAdmin()     { return _get(K_ROLE) === 'admin' && _get(K_ADMIN_OK) === 'true'; }
  function isClient()    { return _get(K_ROLE) === 'client' && !!_get(K_CLIENT_ID); }

  return { init, loginAsClient, loginAsAdmin, logout, logoutToIndex, getClientId, isAdmin, isClient };
})();