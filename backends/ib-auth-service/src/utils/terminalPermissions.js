/**
 * Terminal Command Execution with RBAC
 * Restricts terminal access based on user roles and permissions
 */

const TERMINAL_COMMAND_PERMISSIONS = {
  'system_restart': 'admin',
  'service_restart': 'admin',
  'database_backup': 'admin',
  'log_view': 'manager',
  'file_read': 'user',
  'file_write': 'manager',
  'install_package': 'admin',
  'deploy_service': 'admin',
  'view_metrics': 'user',
  'configure_system': 'admin'
};

const TERMINAL_COMMAND_PATTERNS = {
  'system_restart': /(?:restart|reboot|shutdown)/i,
  'service_restart': /(?:restart|stop|start)\s+(?:service|process)/i,
  'database_backup': /(?:backup|restore|dump)\s+(?:database|db)/i,
  'log_view': /(?:tail|grep|cat)\s+.*\.log/i,
  'file_read': /(?:cat|head|tail)\s+/i,
  'file_write': /(?:echo|write|append)\s+>/i,
  'install_package': /(?:npm|install|apt-get|pip)\s+(?:install|add)/i,
  'deploy_service': /(?:deploy|publish|release)/i,
  'configure_system': /(?:config|set|change|update)\s+(?:system|config)/i
};

class TerminalPermissionManager {
  static getCommandType(command) {
    for (const [type, pattern] of Object.entries(TERMINAL_COMMAND_PATTERNS)) {
      if (pattern.test(command)) {
        return type;
      }
    }
    return 'view_metrics'; // Default to lowest permission
  }

  static canExecuteCommand(userRole, command) {
    const commandType = this.getCommandType(command);
    const requiredRole = TERMINAL_COMMAND_PERMISSIONS[commandType];

    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'user': 1,
      'viewer': 0
    };

    const userRoleLevel = roleHierarchy[userRole?.toLowerCase()] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole?.toLowerCase()] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  static restrictCommand(userRole, command) {
    if (!this.canExecuteCommand(userRole, command)) {
      const commandType = this.getCommandType(command);
      const requiredRole = TERMINAL_COMMAND_PERMISSIONS[commandType];
      throw new Error(
        `User role "${userRole}" cannot execute "${commandType}" command. Required role: "${requiredRole}"`
      );
    }

    return true;
  }

  static getPermittedCommands(userRole) {
    const permitted = [];
    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'user': 1,
      'viewer': 0
    };

    const userRoleLevel = roleHierarchy[userRole?.toLowerCase()] || 0;

    for (const [command, requiredRole] of Object.entries(TERMINAL_COMMAND_PERMISSIONS)) {
      const requiredRoleLevel = roleHierarchy[requiredRole];
      if (userRoleLevel >= requiredRoleLevel) {
        permitted.push(command);
      }
    }

    return permitted;
  }
}

module.exports = TerminalPermissionManager;
