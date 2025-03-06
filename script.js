document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('birthdate-form');
    const birthdateInput = document.getElementById('birthdate');
    const resetButton = document.getElementById('reset-button');
    const resultsSection = document.getElementById('results');
    const calendarContainer = document.getElementById('calendar-container');
    const calendarOptions = document.querySelectorAll('.calendar-option');
    const calendarDescription = document.getElementById('calendar-description');
    
    // Elements for time lived
    const daysLivedElement = document.getElementById('days-lived');
    const hoursLivedElement = document.getElementById('hours-lived');
    const secondsLivedElement = document.getElementById('seconds-lived');
    
    // Elements for progress bars
    const birthdayProgressBar = document.getElementById('birthday-progress');
    const birthdayPercentage = document.getElementById('birthday-percentage');
    const decadeProgressBar = document.getElementById('decade-progress');
    const decadePercentage = document.getElementById('decade-percentage');
    const lifeProgressBar = document.getElementById('life-progress');
    const lifePercentage = document.getElementById('life-percentage');
    
    let birthdate;
    let updateInterval;
    let currentCalendarView = 'year';
    
    // Function to set a cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
    
    // Function to get a cookie
    function getCookie(name) {
        const cname = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(cname) === 0) {
                return c.substring(cname.length, c.length);
            }
        }
        return "";
    }
    
    // Function to delete a cookie
    function deleteCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    
    // Calendar option click handlers
    calendarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            calendarOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Update current view
            currentCalendarView = option.dataset.view;
            
            // Update description text based on view
            if (currentCalendarView === 'year') {
                calendarDescription.textContent = 'DAYS FROM BIRTHDAY TO BIRTHDAY';
            } else if (currentCalendarView === 'decade') {
                calendarDescription.textContent = 'WEEKS OF YOUR CURRENT DECADE';
            } else if (currentCalendarView === 'life') {
                calendarDescription.textContent = 'MONTHS OF YOUR ENTIRE LIFE';
            }
            
            // Update calendar
            updateLifeCalendar();
        });
    });
    
    // Reset button functionality
    resetButton.addEventListener('click', () => {
        // Delete the birthdate cookie
        deleteCookie("birthdate");
        
        // Clear the input field
        birthdateInput.value = "";
        
        // Hide results section
        resultsSection.classList.remove('visible');
        
        // Clear the interval
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        
        // Reset all counters and progress bars
        daysLivedElement.textContent = "0";
        hoursLivedElement.textContent = "0";
        secondsLivedElement.textContent = "0";
        
        birthdayProgressBar.style.width = "0%";
        birthdayPercentage.textContent = "0%";
        
        decadeProgressBar.style.width = "0%";
        decadePercentage.textContent = "0%";
        
        lifeProgressBar.style.width = "0%";
        lifePercentage.textContent = "0%";
        
        // Clear calendar
        calendarContainer.innerHTML = '';
    });
    
    // Check if birthdate cookie exists and load it
    const savedBirthdate = getCookie("birthdate");
    if (savedBirthdate) {
        birthdateInput.value = savedBirthdate;
        // Auto-submit the form if we have a saved birthdate
        birthdate = new Date(savedBirthdate);
        
        // Check if the date is valid
        if (!isNaN(birthdate.getTime())) {
            resultsSection.classList.add('visible');
            updateCalculations();
            updateInterval = setInterval(updateCalculations, 1000);
        }
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get the birthdate from the form
        const birthdateValue = document.getElementById('birthdate').value;
        birthdate = new Date(birthdateValue);
        
        // Check if the date is valid and not in the future
        const today = new Date();
        if (isNaN(birthdate.getTime()) || birthdate > today) {
            alert('Please enter a valid date that is not in the future.');
            return;
        }
        
        // Save birthdate to cookie (expires in 365 days)
        setCookie("birthdate", birthdateValue, 365);
        
        // Show results section
        resultsSection.classList.add('visible');
        
        // Clear any existing interval
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        // Update immediately and then set interval
        updateCalculations();
        updateInterval = setInterval(updateCalculations, 1000);
    });
    
    function updateCalculations() {
        const now = new Date();
        
        // Calculate time lived
        const timeLived = now - birthdate;
        const daysLived = Math.floor(timeLived / (1000 * 60 * 60 * 24));
        const hoursLived = Math.floor(timeLived / (1000 * 60 * 60));
        const secondsLived = Math.floor(timeLived / 1000);
        
        // Update time lived elements
        daysLivedElement.textContent = daysLived.toLocaleString();
        hoursLivedElement.textContent = hoursLived.toLocaleString();
        secondsLivedElement.textContent = secondsLived.toLocaleString();
        
        // Calculate progress to next birthday
        const currentYear = now.getFullYear();
        const birthdayThisYear = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
        
        // If birthday this year has passed, use next year's birthday
        if (now > birthdayThisYear) {
            birthdayThisYear.setFullYear(currentYear + 1);
        }
        
        const lastBirthday = new Date(birthdayThisYear);
        lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
        
        const totalTimeUntilNextBirthday = birthdayThisYear - lastBirthday;
        const timePassedSinceLastBirthday = now - lastBirthday;
        const birthdayProgress = (timePassedSinceLastBirthday / totalTimeUntilNextBirthday) * 100;
        
        // Update birthday progress
        birthdayProgressBar.style.width = `${birthdayProgress}%`;
        birthdayPercentage.textContent = `${birthdayProgress.toFixed(2)}%`;
        
        // Calculate age and decade progress
        const age = calculateAge(birthdate, now);
        const decadeStart = Math.floor(age / 10) * 10;
        const decadeEnd = decadeStart + 10;
        const decadeProgress = ((age - decadeStart) / 10) * 100;
        
        // Update decade progress
        decadeProgressBar.style.width = `${decadeProgress}%`;
        decadePercentage.textContent = `${decadeProgress.toFixed(2)}% (${decadeStart}s)`;
        
        // Calculate life progress (assuming 80 years life expectancy)
        const lifeExpectancy = 100;
        const lifeProgress = (age / lifeExpectancy) * 100;
        
        // Update life progress
        lifeProgressBar.style.width = `${lifeProgress}%`;
        lifePercentage.textContent = `${lifeProgress.toFixed(2)}%`;
        
        // Update life calendar
        updateLifeCalendar();
    }
    
    function updateLifeCalendar() {
        if (!birthdate) return;
        
        const now = new Date();
        
        // Clear previous calendar
        calendarContainer.innerHTML = '';
        
        if (currentCalendarView === 'year') {
            // Create a year view (365 days)
            createYearCalendar(now);
        } else if (currentCalendarView === 'decade') {
            // Create a decade view (10 years x 52 weeks)
            createDecadeCalendar(now);
        } else if (currentCalendarView === 'life') {
            // Create a life view (80 years x 12 months)
            createLifeCalendar(now);
        }
    }
    
    function createYearCalendar(now) {
        // Calculate last birthday
        const age = calculateAge(birthdate, now);
        const lastBirthdayDate = new Date(birthdate);
        lastBirthdayDate.setFullYear(birthdate.getFullYear() + Math.floor(age));
        
        // If last birthday is in the future, go back one year
        if (lastBirthdayDate > now) {
            lastBirthdayDate.setFullYear(lastBirthdayDate.getFullYear() - 1);
        }
        
        // Calculate next birthday
        const nextBirthdayDate = new Date(lastBirthdayDate);
        nextBirthdayDate.setFullYear(nextBirthdayDate.getFullYear() + 1);
        
        // Create 13 months starting from birthday month (to include birthday month at the bottom)
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        
        // Start with the birth month
        const birthMonth = lastBirthdayDate.getMonth();
        
        // Create months from birth month to birth month of next year (13 months total)
        for (let i = 0; i < 13; i++) {
            const monthIndex = (birthMonth + i) % 12;
            const monthDate = new Date(lastBirthdayDate);
            
            // If we've wrapped around to the next year
            if (i >= 12 - birthMonth) {
                monthDate.setFullYear(monthDate.getFullYear() + 1);
            }
            
            monthDate.setMonth(monthIndex);
            
            // Create row for this month
            const monthRow = document.createElement('div');
            monthRow.className = 'calendar-row';
            
            // Add month label
            const monthLabel = document.createElement('div');
            monthLabel.className = 'calendar-row-label';
            monthLabel.textContent = monthNames[monthIndex];
            monthRow.appendChild(monthLabel);
            
            // Create month container
            const monthDiv = document.createElement('div');
            monthDiv.className = 'calendar-year';
            
            // Get days in this month
            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
            
            // For the first month (birth month), we need to start from the birth day
            let startDay = 1;
            if (i === 0) {
                startDay = lastBirthdayDate.getDate();
            }
            
            // For the last month (next birth month), we need to end at the birth day - 1
            let endDay = daysInMonth;
            if (i === 12) {
                endDay = nextBirthdayDate.getDate() - 1;
                if (endDay <= 0) endDay = daysInMonth;
            }
            
            // Add empty placeholders for days before the start day to maintain position
            if (i === 0 && startDay > 1) {
                for (let d = 1; d < startDay; d++) {
                    const placeholderBox = document.createElement('div');
                    placeholderBox.className = 'calendar-box placeholder';
                    monthDiv.appendChild(placeholderBox);
                }
            }
            
            // Create boxes for each day in the month
            for (let day = startDay; day <= endDay; day++) {
                const dayBox = document.createElement('div');
                dayBox.className = 'calendar-box';
                
                // Calculate if this day has passed
                const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                
                if (dayDate < now) {
                    dayBox.classList.add('filled');
                }
                
                monthDiv.appendChild(dayBox);
            }
            
            // Add month div to row
            monthRow.appendChild(monthDiv);
            
            // Add row to container
            calendarContainer.appendChild(monthRow);
        }
    }
    
    function createDecadeCalendar(now) {
        // Calculate current decade
        const age = calculateAge(birthdate, now);
        const decadeStart = Math.floor(age / 10) * 10;
        
        // Calculate start date of the decade
        const decadeStartDate = new Date(birthdate);
        decadeStartDate.setFullYear(birthdate.getFullYear() + decadeStart);
        
        // Create 10 rows for each year in the decade
        for (let year = 0; year < 10; year++) {
            // Create row for this year
            const yearRow = document.createElement('div');
            yearRow.className = 'calendar-row';
            
            // Add year label
            const yearLabel = document.createElement('div');
            yearLabel.className = 'calendar-row-label';
            yearLabel.textContent = (decadeStart + year);
            yearRow.appendChild(yearLabel);
            
            const yearStartDate = new Date(decadeStartDate);
            yearStartDate.setFullYear(decadeStartDate.getFullYear() + year);
            
            // Create year container
            const yearDiv = document.createElement('div');
            yearDiv.className = 'calendar-decade';
            
            // Create 52 boxes for weeks in a year
            for (let week = 0; week < 52; week++) {
                const weekBox = document.createElement('div');
                weekBox.className = 'calendar-box';
                
                // Calculate if this week has passed
                const weekStart = new Date(yearStartDate);
                weekStart.setDate(weekStart.getDate() + (week * 7));
                
                if (weekStart < now && weekStart >= decadeStartDate) {
                    weekBox.classList.add('filled');
                }
                
                yearDiv.appendChild(weekBox);
            }
            
            // Add year div to row
            yearRow.appendChild(yearDiv);
            
            // Add row to container
            calendarContainer.appendChild(yearRow);
        }
    }
    
    function createLifeCalendar(now) {
        const lifeExpectancy = 100;
        const yearsPerRow = 6; // Display 6 years per row instead of 5
        
        // Create a container for all the year blocks
        const lifeCalendarContainer = document.createElement('div');
        lifeCalendarContainer.className = 'life-calendar-container';
        
        // Calculate how many rows we need
        const totalRows = Math.ceil(lifeExpectancy / yearsPerRow);
        
        // Create rows of years
        for (let row = 0; row < totalRows; row++) {
            // Create a row container
            const yearRow = document.createElement('div');
            yearRow.className = 'life-year-row';
            
            // Add year blocks for this row
            for (let col = 0; col < yearsPerRow; col++) {
                const yearIndex = row * yearsPerRow + col;
                
                // Create year container
                const yearBlock = document.createElement('div');
                yearBlock.className = 'life-year-block';
                
                // If we've reached the life expectancy, create an empty block for consistent layout
                if (yearIndex >= lifeExpectancy) {
                    yearBlock.style.visibility = 'hidden'; // Hide but preserve space
                    yearRow.appendChild(yearBlock);
                    continue;
                }
                
                // Add year label
                const yearLabel = document.createElement('div');
                yearLabel.className = 'life-year-label';
                yearLabel.textContent = yearIndex;
                yearBlock.appendChild(yearLabel);
                
                // Create month container
                const monthContainer = document.createElement('div');
                monthContainer.className = 'life-month-container';
                
                // Calculate the start date for this year
                const yearStartDate = new Date(birthdate);
                yearStartDate.setFullYear(birthdate.getFullYear() + yearIndex);
                
                // Create 12 boxes for months in a year
                for (let month = 0; month < 12; month++) {
                    const monthBox = document.createElement('div');
                    monthBox.className = 'calendar-box';
                    
                    // Calculate if this month has passed
                    const monthStart = new Date(yearStartDate);
                    monthStart.setMonth(monthStart.getMonth() + month);
                    
                    if (monthStart < now) {
                        monthBox.classList.add('filled');
                    }
                    
                    monthContainer.appendChild(monthBox);
                }
                
                // Add month container to year block
                yearBlock.appendChild(monthContainer);
                
                // Add year block to row
                yearRow.appendChild(yearBlock);
            }
            
            // Add row to container
            lifeCalendarContainer.appendChild(yearRow);
        }
        
        // Add the life calendar container to the main calendar container
        calendarContainer.appendChild(lifeCalendarContainer);
    }
    
    function calculateAge(birthdate, currentDate) {
        let age = currentDate.getFullYear() - birthdate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthdate.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthdate.getDate())) {
            age--;
        }
        
        // Calculate the fractional part of the age
        const lastBirthday = new Date(birthdate);
        lastBirthday.setFullYear(currentDate.getFullYear() - (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthdate.getDate()) ? 1 : 0));
        
        const nextBirthday = new Date(lastBirthday);
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        
        const totalDaysInYear = (nextBirthday - lastBirthday) / (1000 * 60 * 60 * 24);
        const daysPassed = (currentDate - lastBirthday) / (1000 * 60 * 60 * 24);
        
        return age + (daysPassed / totalDaysInYear);
    }
}); 