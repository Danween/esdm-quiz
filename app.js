// Quiz ESDM - Main Application Logic
// Dinas ESDM Provinsi Jambi

// Configuration
// Quiz ESDM - Main Application Logic
// Dinas ESDM Provinsi Jambi

// Configuration
const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://wbgdoiiztuvmkqzqgeql.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2RvaWl6dHV2bWtxenFnZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzA3MzksImV4cCI6MjA4MjY0NjczOX0.hNh6_j3c_QDAKz7QTmLdE7p_7nZjwEGnffErAF6wArU',
    
    SYNC_INTERVAL: 2000 // Sync setiap 2 detik
};

// Initialize Supabase Client - cek apakah sudah ada atau belum
let supabaseClient;
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
    );
} else {
    console.error('Supabase library not loaded. Please include Supabase CDN.');
}

// Initialize localStorage if empty (fallback)
if (!localStorage.getItem('participants')) {
    localStorage.setItem('participants', JSON.stringify([]));
}

// Supabase Sync Functions
const SupabaseSync = {
    // Fetch all participants from Supabase
    async fetchParticipants() {
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return null;
        }

        try {
            const { data, error } = await supabaseClient
                .from('participants')
                .select('*')
                .order('registered_at', { ascending: false });
            
            if (error) throw error;
            
            // Transform Supabase data ke format aplikasi
            return data.map(p => ({
                id: p.id,
                nama: p.nama,
                noHp: p.no_hp,
                email: p.email,
                instansi: p.instansi,
                status: p.status,
                score: p.score,
                questions: p.questions,
                answers: p.answers,
                currentQuestion: p.current_question,
                registeredAt: p.registered_at,
                startedAt: p.started_at,
                finishedAt: p.finished_at
            }));
        } catch (error) {
            console.warn('Supabase fetch failed, using localStorage:', error);
            return null;
        }
    },

    // Add new participant
    async addParticipant(participant) {
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return null;
        }

        try {
            const { data, error } = await supabaseClient
                .from('participants')
                .insert([{
                    nama: participant.nama,
                    no_hp: participant.noHp,
                    email: participant.email,
                    instansi: participant.instansi,
                    status: participant.status || 'waiting',
                    score: participant.score || 0,
                    questions: participant.questions || null,
                    answers: participant.answers || null,
                    current_question: participant.currentQuestion || 0
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                id: data.id,
                nama: data.nama,
                noHp: data.no_hp,
                email: data.email,
                instansi: data.instansi,
                status: data.status,
                score: data.score,
                questions: data.questions,
                answers: data.answers,
                currentQuestion: data.current_question,
                registeredAt: data.registered_at,
                startedAt: data.started_at,
                finishedAt: data.finished_at
            };
        } catch (error) {
            console.error('Supabase add failed:', error);
            return null;
        }
    },

    // Update participant
    async updateParticipant(id, updates) {
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return null;
        }

        try {
            // Transform updates ke format Supabase
            const supabaseUpdates = {};
            if (updates.nama !== undefined) supabaseUpdates.nama = updates.nama;
            if (updates.noHp !== undefined) supabaseUpdates.no_hp = updates.noHp;
            if (updates.email !== undefined) supabaseUpdates.email = updates.email;
            if (updates.instansi !== undefined) supabaseUpdates.instansi = updates.instansi;
            if (updates.status !== undefined) supabaseUpdates.status = updates.status;
            if (updates.score !== undefined) supabaseUpdates.score = updates.score;
            if (updates.questions !== undefined) supabaseUpdates.questions = updates.questions;
            if (updates.answers !== undefined) supabaseUpdates.answers = updates.answers;
            if (updates.currentQuestion !== undefined) supabaseUpdates.current_question = updates.currentQuestion;
            if (updates.startedAt !== undefined) supabaseUpdates.started_at = updates.startedAt;
            if (updates.finishedAt !== undefined) supabaseUpdates.finished_at = updates.finishedAt;

            const { data, error } = await supabaseClient
                .from('participants')
                .update(supabaseUpdates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                id: data.id,
                nama: data.nama,
                noHp: data.no_hp,
                email: data.email,
                instansi: data.instansi,
                status: data.status,
                score: data.score,
                questions: data.questions,
                answers: data.answers,
                currentQuestion: data.current_question,
                registeredAt: data.registered_at,
                startedAt: data.started_at,
                finishedAt: data.finished_at
            };
        } catch (error) {
            console.error('Supabase update failed:', error);
            return null;
        }
    },

    // Delete participant
    async deleteParticipant(id) {
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return false;
        }

        try {
            const { error } = await supabaseClient
                .from('participants')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase delete failed:', error);
            return false;
        }
    },

    // Clear all participants
    async clearAll() {
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return false;
        }

        try {
            const { error } = await supabaseClient
                .from('participants')
                .delete()
                .neq('id', 0); // Delete all records
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase clear all failed:', error);
            return false;
        }
    },

    // Get participant by ID
    async getParticipantById(id) {
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            return null;
        }

        try {
            const { data, error } = await supabaseClient
                .from('participants')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            return {
                id: data.id,
                nama: data.nama,
                noHp: data.no_hp,
                email: data.email,
                instansi: data.instansi,
                status: data.status,
                score: data.score,
                questions: data.questions,
                answers: data.answers,
                currentQuestion: data.current_question,
                registeredAt: data.registered_at,
                startedAt: data.started_at,
                finishedAt: data.finished_at
            };
        } catch (error) {
            console.error('Supabase get by ID failed:', error);
            return null;
        }
    }
};

// ... sisanya sama seperti sebelumnya

// Utility Functions
const QuizApp = {
    // Get all participants
    getParticipants: async function() {
        const cloudData = await SupabaseSync.fetchParticipants();
        if (cloudData) {
            // Update localStorage sebagai cache
            localStorage.setItem('participants', JSON.stringify(cloudData));
            return cloudData;
        }
        return JSON.parse(localStorage.getItem('participants') || '[]');
    },

    // Add new participant
    addParticipant: async function(participant) {
        const newParticipant = await SupabaseSync.addParticipant(participant);
        if (newParticipant) {
            this.triggerStorageEvent();
            return newParticipant;
        }
        return null;
    },

    // Get participant by ID
    getParticipantById: async function(id) {
        return await SupabaseSync.getParticipantById(id);
    },

    // Update participant
    updateParticipant: async function(id, updates) {
        const updated = await SupabaseSync.updateParticipant(id, updates);
        if (updated) {
            this.triggerStorageEvent();
            return updated;
        }
        return null;
    },

    // Delete participant
    deleteParticipant: async function(id) {
        const success = await SupabaseSync.deleteParticipant(id);
        if (success) {
            this.triggerStorageEvent();
        }
        return success;
    },

    // Clear all participants
    clearAllParticipants: async function() {
        if (confirm('Yakin ingin menghapus semua data peserta?')) {
            const success = await SupabaseSync.clearAll();
            if (success) {
                localStorage.setItem('participants', JSON.stringify([]));
                this.triggerStorageEvent();
                return true;
            }
        }
        return false;
    },

    // Get random questions from bank
    getRandomQuestions: function(count) {
        if (typeof questionBank === 'undefined') {
            console.error('Question bank not loaded');
            return [];
        }
        
        const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    // Calculate score
    calculateScore: function(answers, questions) {
        let score = 0;
        answers.forEach(answer => {
            if (answer.isCorrect) {
                score++;
            }
        });
        return score;
    },

    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString('id-ID', options);
    },

    // Trigger storage event for cross-tab communication
    triggerStorageEvent: function() {
        window.dispatchEvent(new Event('storage'));
    },

    // Export results to CSV
    exportToCSV: async function() {
        const participants = await this.getParticipants();
        if (participants.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        let csv = 'No,Nama,No HP,Email,Instansi,Status,Skor,Total Soal,Persentase,Waktu Daftar,Waktu Selesai\n';
        
        participants.forEach((p, index) => {
            const totalQuestions = p.questions?.length || 0;
            const percentage = totalQuestions > 0 ? Math.round((p.score / totalQuestions) * 100) : 0;
            
            csv += `${index + 1},`;
            csv += `"${p.nama}",`;
            csv += `"${p.noHp}",`;
            csv += `"${p.email}",`;
            csv += `"${p.instansi || '-'}",`;
            csv += `"${p.status}",`;
            csv += `${p.score || 0},`;
            csv += `${totalQuestions},`;
            csv += `${percentage}%,`;
            csv += `"${this.formatDate(p.registeredAt)}",`;
            csv += `"${p.finishedAt ? this.formatDate(p.finishedAt) : '-'}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `quiz-esdm-${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Get statistics
    getStatistics: async function() {
        const participants = await this.getParticipants();
        
        return {
            total: participants.length,
            waiting: participants.filter(p => p.status === 'waiting').length,
            playing: participants.filter(p => p.status === 'playing').length,
            finished: participants.filter(p => p.status === 'finished').length,
            averageScore: await this.getAverageScore(),
            highestScore: await this.getHighestScore(),
            lowestScore: await this.getLowestScore()
        };
    },

    // Get average score
    getAverageScore: async function() {
        const participants = await this.getParticipants();
        const finishedParticipants = participants.filter(p => p.status === 'finished');
        
        if (finishedParticipants.length === 0) return 0;
        
        const totalScore = finishedParticipants.reduce((sum, p) => sum + (p.score || 0), 0);
        return Math.round(totalScore / finishedParticipants.length);
    },

    // Get highest score
    getHighestScore: async function() {
        const participants = await this.getParticipants();
        const finishedParticipants = participants.filter(p => p.status === 'finished');
        
        if (finishedParticipants.length === 0) return 0;
        
        return Math.max(...finishedParticipants.map(p => p.score || 0));
    },

    // Get lowest score
    getLowestScore: async function() {
        const participants = await this.getParticipants();
        const finishedParticipants = participants.filter(p => p.status === 'finished');
        
        if (finishedParticipants.length === 0) return 0;
        
        return Math.min(...finishedParticipants.map(p => p.score || 0));
    },

    // Validate phone number
    validatePhone: function(phone) {
        const phoneRegex = /^[0-9]{10,13}$/;
        return phoneRegex.test(phone);
    },

    // Validate email
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Show toast notification
    showToast: function(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 animate-fade-in`;
        
        switch(type) {
            case 'success':
                toast.classList.add('bg-green-500');
                break;
            case 'error':
                toast.classList.add('bg-red-500');
                break;
            case 'warning':
                toast.classList.add('bg-yellow-500');
                break;
            default:
                toast.classList.add('bg-blue-500');
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Application Error:', e.error);
});

// Log initialization
console.log('Quiz ESDM Application Loaded');
console.log('Supabase Connected:', CONFIG.SUPABASE_URL);
console.log('Question Bank Size:', typeof questionBank !== 'undefined' ? questionBank.length : 'Not loaded');

// Auto-sync from Supabase every interval
setInterval(async () => {
    await QuizApp.getParticipants(); // Fetch latest dari Supabase
}, CONFIG.SYNC_INTERVAL);

console.log(`Auto-sync enabled: ${CONFIG.SYNC_INTERVAL}ms interval`);

// Setup Supabase Realtime Subscription untuk live updates
if (supabaseClient) {
    const participantsChannel = supabaseClient
        .channel('participants-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'participants' },
            (payload) => {
                console.log('Realtime update:', payload);
                QuizApp.triggerStorageEvent();
            }
        )
        .subscribe();

    console.log('Supabase Realtime: Subscribed to participants table');
}

// Make QuizApp and supabaseClient available globally
window.QuizApp = QuizApp;
window.supabaseClient = supabaseClient; // INI PENTING!

console.log('QuizApp loaded:', window.QuizApp ? 'YES' : 'NO');
console.log('supabaseClient loaded:', window.supabaseClient ? 'YES' : 'NO');
