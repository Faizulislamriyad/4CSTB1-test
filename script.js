function toggleNotice(element) {
    const details = element.nextElementSibling;
    if (details.style.display === "block") {
        details.style.display = "none";
    } else {
        details.style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Day names
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Today's date and day
    const today = new Date();
    const dayIndex = today.getDay(); // 0=Sunday, 1=Monday, etc.
    const dayName = days[dayIndex];
    
    // Format date
    const dateString = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Update UI
    document.getElementById('todayDate').textContent = dateString;
    document.getElementById('today-day').textContent = dayName;
    
    // Routine data
    const routineData = {
        'Sunday': [
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Bu', name: 'Business', teacher: 'Mostofa Jaman', room: '239' },
            { subject: 'En', name: 'Environment', teacher: 'Trishna Chakroborthy', room: '239' },
            { subject: 'We', name: 'Web D&D', teacher: 'Selim Khalifa', room: '239' },
            { subject: 'Ja', name: 'Java', teacher: 'MST. Rabeya Jannat', room: '239' },
            { subject: 'Da', name: 'Data Structure', teacher: 'Md. Parveg Mia', room: '239' },
            { subject: 'Da', name: 'Data Structure', teacher: 'Md. Parveg Mia', room: '239' },
            { subject: 'Da', name: 'Data Structure', teacher: 'Md. Parveg Mia', room: '239' }
        ],
        'Monday': [
            { subject: 'En', name: 'Environment', teacher: 'Trishna Chakroborthy', room: '338' },
            { subject: 'Da', name: 'Data Structure', teacher: 'Md. Parveg Mia', room: '338' },
            { subject: 'Ja', name: 'Java', teacher: 'Mst. Rabeya Jannat', room: '338' },
            { subject: 'Di', name: 'Digital El-2', teacher: 'GMM Abu Hurayra', room: '338' },
            { subject: 'Co', name: 'Computer P&I', teacher: 'Kazi Golam kibria', room: '338' },
            { subject: 'We', name: 'Web Design & Development', teacher: 'Selim Khalifa', room: 'CMT-2' },
            { subject: 'We', name: 'Web Design & Development', teacher: 'Selim Khalifa', room: 'CMT-2' },
            { subject: 'We', name: 'Web Design & Development', teacher: 'Selim Khalifa', room: 'CMT-2' }
        ],
        'Tuesday': [
            { subject: 'Di', name: 'Digital EL-2', teacher: 'GMM Abu Hurayra', room: 'R & AI Lab' },
            { subject: 'Di', name: 'Digital EL-2', teacher: 'GMM Abu Hurayra', room: 'R & AI Lab' },
            { subject: 'Di', name: 'Digital EL-2', teacher: 'GMM Abu Hurayra', room: 'R & AI Lab' },
            { subject: 'Co', name: 'Computer P&I', teacher: 'Kazi Golam kibria', room: 'CMT-1' },
            { subject: 'Ja', name: 'Java', teacher: 'Mst. Rabeya Jannat', room: 'CMT-1' },
            { subject: 'Ja', name: 'Java', teacher: 'Mst. Rabeya Jannat', room: 'CMT-1' },
            { subject: 'Ja', name: 'Java', teacher: 'Mst. Rabeya Jannat', room: 'CMT-1' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' }
        ],
        'Wednesday': [
            { subject: 'We', name: 'Web D&D', teacher: 'Selim Khalifa', room: 'CMT-1' },
            { subject: 'We', name: 'Web D&D', teacher: 'Selim Khalifa', room: 'CMT-1' },
            { subject: 'We', name: 'Web D&D', teacher: 'Selim Khalifa', room: 'CMT-1' },
            { subject: 'Co', name: 'Computer P&I', teacher: 'Kazi Golam kibria', room: '240' },
            { subject: 'Di', name: 'Digital EL-2', teacher: 'GMM Abu Hurayra', room: '240' },
            { subject: 'Bu', name: 'Business', teacher: 'Mostofa Jaman', room: '240' },
            { subject: 'Da', name: 'Data Structure', teacher: 'Md. Parveg Mia', room: '240' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' }
        ],
        'Thursday': [
            { subject: 'Co', name: 'Computer P&I', teacher: 'Kazi Golam kibria', room: 'CMT-1' },
            { subject: 'Co', name: 'Computer P&I', teacher: 'Kazi Golam kibria', room: 'CMT-1' },
            { subject: 'Co', name: 'Computer P&I', teacher: 'Kazi Golam kibria', room: 'CMT-1' },
            { subject: 'En', name: 'Environment', teacher: 'Trishna Chakroborthy', room: '338' },
            { subject: 'En', name: 'Environment', teacher: 'Trishna Chakroborthy', room: '338' },
            { subject: 'En', name: 'Environment', teacher: 'Trishna Chakroborthy', room: '338' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' }
        ],
        'Friday': [
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' }
        ],
        'Saturday': [
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' },
            { subject: 'Gap', name: 'No Class', teacher: '', room: '' }
        ]
    };
    
    // Get today's routine
    const todayRoutine = routineData[dayName] || [];
    
    // Create table row for today's routine
    const tbody = document.getElementById('todayRoutine');
    const row = document.createElement('tr');
    
    // Add day cell
    const dayCell = document.createElement('th');
    dayCell.textContent = dayName;
    row.appendChild(dayCell);
    
    // Process today's routine to merge consecutive same subjects
    let i = 0;
    while (i < todayRoutine.length) {
        const currentSubject = todayRoutine[i];
        let colspan = 1;
        
        // Check how many consecutive periods have the same subject
        for (let j = i + 1; j < todayRoutine.length; j++) {
            if (todayRoutine[j].subject === currentSubject.subject) {
                colspan++;
            } else {
                break;
            }
        }
        
        // Create cell with colspan
        const cell = document.createElement('td');
        cell.className = `subject-cell ${currentSubject.subject}`;
        cell.colSpan = colspan;
        
        const subjectDiv = document.createElement('div');
        subjectDiv.textContent = currentSubject.name;
        cell.appendChild(subjectDiv);
        
        if (currentSubject.teacher) {
            const teacherDiv = document.createElement('div');
            teacherDiv.className = 'teacher-info';
            teacherDiv.textContent = `${currentSubject.teacher} (${currentSubject.room})`;
            cell.appendChild(teacherDiv);
        }
        
        row.appendChild(cell);
        
        // Skip the merged periods
        i += colspan;
    }
    
    tbody.appendChild(row);
});