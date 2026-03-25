// API Key Configuration
// This file can be updated to override environment variables

module.exports = {
    // Primary Groq API Key (from environment)
    primary: process.env.GROQ_API_KEY,
    
    // Backup/Override key (set this when primary is rate limited)
    backup: process.env.GROQ_BACKUP_KEY,
    
    // Get the active key (backup takes priority if set)
    getActiveKey() {
        const activeKey = this.backup || this.primary;
        console.log('🔑 API Key Status:', {
            primary: this.primary ? this.primary.substring(0, 20) + '...' : 'NOT SET',
            backup: this.backup ? this.backup.substring(0, 20) + '...' : 'NOT SET',
            active: activeKey ? activeKey.substring(0, 20) + '...' : 'NOT SET'
        });
        return activeKey;
    }
};