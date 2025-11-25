document.addEventListener('DOMContentLoaded', () => {
    const rootContainer = document.getElementById('flowsheet-root');
    
    fetch('JavaScript/courses.json')
        .then(response => response.json())
        .then(data => {
            generateFlowsheetHTML(data);
            
            initializeHighlighter();
        })
        .catch(error => {
            console.error('Error loading course data:', error);
            rootContainer.innerHTML = '<p>Error loading course data. Please check console.</p>';
        });
});


function generateFlowsheetHTML(yearsData) {
    const rootContainer = document.getElementById('flowsheet-root');
    let allHTML = '';

    // Loop through each year
    yearsData.forEach(year => {
        let quartersHTML = '';
        
        // Loop through each quarter in that year
        year.quarters.forEach(quarter => {
            let coursesHTML = '';
            
            // Loop through each course in that quarter
            quarter.courses.forEach(course => {
                coursesHTML += `
                    <div class="course" id="${course.id}" data-prereqs="${course.prereqs.join(' ')}">
                        <strong>${course.title}</strong>
                        <small>${course.subtitle}</small>
                    </div>
                `;
            });

            quartersHTML += `
                <div class="quarter-column">
                    <h3>${quarter.quarterName}</h3>
                    ${coursesHTML}
                </div>
            `;
        });

        allHTML += `
            <div class="year-group">
                <h2>${year.yearName}</h2>
                <div class="quarters-container">
                    ${quartersHTML}
                </div>
            </div>
        `;
    });

    rootContainer.innerHTML = allHTML;
}


function initializeHighlighter() {
    const allCourses = document.querySelectorAll('.course');
    const allCoursesMap = new Map();
    allCourses.forEach(course => allCoursesMap.set(course.id, course));

    allCourses.forEach(course => {
        // Find what this course unlocks
        const unlocks = [];
        allCourses.forEach(otherCourse => {
            // This line still works because we built the data-prereqs just like before
            const prereqs = otherCourse.dataset.prereqs.split(' ');
            if (prereqs.includes(course.id)) {
                unlocks.push(otherCourse.id);
            }
        });
        course.dataset.unlocks = unlocks.join(' ');

        // Add mouse hover event
        course.addEventListener('mouseenter', () => {
            highlightCourses(course);
        });

        // Add mouse leave event
        course.addEventListener('mouseleave', () => {
            removeHighlights();
        });
    });

    function highlightCourses(hoveredCourse) {
        // 1. Dim all courses
        allCourses.forEach(c => c.classList.add('dimmed'));

        // 2. Highlight the hovered course
        hoveredCourse.classList.remove('dimmed');
        hoveredCourse.classList.add('hover-active');


        // 3. Get Level 1 (Primary) Prereqs
        const primaryPrereqIds = hoveredCourse.dataset.prereqs.split(' ').filter(Boolean);
        
        // 4. Get Level 2 (Secondary) Prereqs
        const secondaryPrereqIds = [];
        primaryPrereqIds.forEach(id => {
            const primaryEl = allCoursesMap.get(id);
            if (primaryEl) {
                // Get the prereqs of the primary prereq
                const secondaryIds = primaryEl.dataset.prereqs.split(' ').filter(Boolean);
                secondaryPrereqIds.push(...secondaryIds);
            }
        });

        // Use Sets for efficient lookups
        const primarySet = new Set(primaryPrereqIds);
        const secondarySet = new Set(secondaryPrereqIds);

        // 5. Style Level 2 Prereqs (do this first)
        secondarySet.forEach(id => {
            // ONLY style as secondary if it's NOT also a primary prereq
            if (!primarySet.has(id)) {
                const secondaryEl = allCoursesMap.get(id);
                if (secondaryEl) {
                    secondaryEl.classList.remove('dimmed');
                    secondaryEl.classList.add('prereq-secondary-active'); 
                }
            }
        });

        // 6. Style Level 1 Prereqs (do this second to override L2)
        primarySet.forEach(id => {
            const primaryEl = allCoursesMap.get(id);
            if (primaryEl) {
                primaryEl.classList.remove('dimmed', 'prereq-secondary-active'); // Remove L2 style just in case
                primaryEl.classList.add('prereq-active');
            }
        });


        // 7. Highlight unlocks
        const unlocksIds = hoveredCourse.dataset.unlocks.split(' ');
        unlocksIds.forEach(id => {
            const unlockEl = allCoursesMap.get(id);
            if (unlockEl) {
                unlockEl.classList.remove('dimmed');
                unlockEl.classList.add('unlocks-active');
            }
        });
    }

    function removeHighlights() {
        allCourses.forEach(c => {
            c.classList.remove(
                'dimmed', 
                'hover-active', 
                'prereq-active', 
                'prereq-secondary-active', 
                'unlocks-active'
            );
        });
    }
}