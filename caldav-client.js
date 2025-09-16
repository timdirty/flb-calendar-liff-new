// CalDAV 客戶端模組
const axios = require('axios');
const ICAL = require('ical.js');

class CalDAVClient {
    constructor(baseUrl, username, password) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'; // 確保有結尾斜線
        this.username = username;
        this.password = password;
        this.auth = Buffer.from(`${username}:${password}`).toString('base64');
    }

    // 獲取所有行事曆列表
    async getCalendars() {
        try {
            console.log('CalDAV 請求 URL:', this.baseUrl);
            console.log('CalDAV 認證:', this.auth);
            
            // 直接訪問用戶的行事曆目錄
            const userUrl = `${this.baseUrl}${this.username}/`;
            console.log('用戶行事曆 URL:', userUrl);
            
            const response = await axios.request({
                method: 'PROPFIND',
                url: userUrl,
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/xml',
                    'Depth': '1'
                },
                data: `<?xml version="1.0" encoding="utf-8" ?><D:propfind xmlns:D="DAV:"><D:prop><D:displayname/><D:resourcetype/></D:prop></D:propfind>`
            });

            console.log('CalDAV 回應狀態:', response.status);
            console.log('CalDAV 回應資料長度:', response.data?.length || 0);
            
            return this.parseCalendarList(response.data);
        } catch (error) {
            console.error('獲取行事曆列表失敗:', error.message);
            console.error('錯誤狀態碼:', error.response?.status);
            console.error('錯誤回應:', error.response?.data);
            throw error; // 直接拋出錯誤，不使用備用資料
        }
    }

    // 獲取預設講師列表
    getDefaultInstructors() {
        return [
            { path: '/caldav/testacount/', displayName: 'testacount' },
            { path: '/caldav/teacher1/', displayName: '張老師' },
            { path: '/caldav/teacher2/', displayName: '李老師' },
            { path: '/caldav/teacher3/', displayName: '王老師' }
        ];
    }

    // 獲取指定行事曆的事件
    async getEvents(calendarPath, startDate, endDate) {
        try {
            const start = startDate.toISOString().split('T')[0].replace(/-/g, '');
            const end = endDate.toISOString().split('T')[0].replace(/-/g, '');
            
            const response = await axios.request({
                method: 'REPORT',
                url: `https://funlearnbar.synology.me:9102${calendarPath}`,
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/xml',
                    'Depth': '1'
                },
                data: `<?xml version="1.0" encoding="utf-8" ?>
                <C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
                    <D:prop>
                        <D:getetag/>
                        <C:calendar-data/>
                    </D:prop>
                    <C:filter>
                        <C:comp-filter name="VCALENDAR">
                            <C:comp-filter name="VEVENT">
                                <C:time-range start="${start}T000000Z" end="${end}T235959Z"/>
                            </C:comp-filter>
                        </C:comp-filter>
                    </C:filter>
                </C:calendar-query>`
            });

            return this.parseEvents(response.data);
        } catch (error) {
            console.error('獲取事件失敗:', error.message);
            throw error; // 直接拋出錯誤，不使用備用資料
        }
    }

    // 為特定講師生成範例事件
    generateSampleEventsForInstructor(calendarPath) {
        const today = new Date();
        const events = [];
        const instructorName = this.getInstructorNameFromPath(calendarPath);
        
        // 生成一些範例事件
        for (let i = 0; i < 3; i++) {
            const eventDate = new Date(today);
            eventDate.setDate(today.getDate() + i);
            
            const courseTypes = ['程式設計', '資料結構', '演算法', '網頁開發', '資料庫'];
            const locations = ['教室A', '教室B', '教室C', '電腦教室', '會議室'];
            
            events.push({
                id: `${instructorName}_${i + 1}`,
                title: `${courseTypes[i % courseTypes.length]} 課程`,
                time: '10:00-12:00',
                location: locations[i % locations.length],
                description: `${instructorName} 的課程內容`,
                date: eventDate,
                type: 'course',
                instructor: instructorName
            });
        }
        
        return events;
    }

    // 從路徑中提取講師名稱
    getInstructorNameFromPath(calendarPath) {
        const parts = calendarPath.split('/');
        const lastPart = parts[parts.length - 2] || parts[parts.length - 1];
        return lastPart === 'testacount' ? 'testacount' : lastPart;
    }

    // 獲取所有講師的行程
    async getAllInstructorEvents(startDate, endDate) {
        try {
            const calendars = await this.getCalendars();
            const allEvents = [];

            for (const calendar of calendars) {
                try {
                    const events = await this.getEvents(calendar.path, startDate, endDate);
                    // 為每個事件添加講師資訊
                    const eventsWithInstructor = events.map(event => ({
                        ...event,
                        instructor: calendar.displayName || '未知講師',
                        calendarPath: calendar.path
                    }));
                    allEvents.push(...eventsWithInstructor);
                } catch (error) {
                    console.warn(`無法獲取行事曆 ${calendar.displayName} 的事件:`, error.message);
                    // 跳過失敗的行事曆，不使用備用資料
                    continue;
                }
            }

            return allEvents;
        } catch (error) {
            console.error('獲取所有講師事件失敗:', error.message);
            throw error; // 直接拋出錯誤，不使用備用資料
        }
    }

    // 生成所有講師的範例事件
    generateAllInstructorsSampleEvents() {
        const instructors = this.getDefaultInstructors();
        const allEvents = [];
        
        instructors.forEach(instructor => {
            const events = this.generateSampleEventsForInstructor(instructor.path);
            const eventsWithInstructor = events.map(event => ({
                ...event,
                instructor: instructor.displayName,
                calendarPath: instructor.path
            }));
            allEvents.push(...eventsWithInstructor);
        });
        
        return allEvents;
    }

    // 解析行事曆列表
    parseCalendarList(xmlData) {
        const calendars = [];
        try {
            console.log('XML 回應內容:', xmlData.substring(0, 500) + '...');
            
            // 解析 XML 回應，尋找所有行事曆路徑和顯示名稱
            const responseRegex = /<response>([\s\S]*?)<\/response>/g;
            let responseMatch;
            
            while ((responseMatch = responseRegex.exec(xmlData)) !== null) {
                const responseContent = responseMatch[1];
                
                // 提取路徑
                const hrefMatch = responseContent.match(/<href>([^<]+)<\/href>/);
                if (!hrefMatch) continue;
                
                const path = hrefMatch[1];
                console.log('找到路徑:', path);
                
                // 過濾出用戶的行事曆（不包含根目錄和特殊目錄）
                if (path.startsWith(`/caldav.php/${this.username}/`) && 
                    path !== `/caldav.php/${this.username}/` && 
                    !path.includes('/.in/') &&
                    !path.includes('/home_todo/') &&
                    !path.includes('/home/')) {
                    
                    // 提取顯示名稱
                    const displayNameMatch = responseContent.match(/<displayname>([^<]+)<\/displayname>/);
                    const displayName = displayNameMatch ? displayNameMatch[1] : path.split('/').slice(-2, -1)[0];
                    
                    calendars.push({
                        path: path,
                        displayName: displayName
                    });
                    console.log('添加行事曆:', displayName, path);
                }
            }
            
            console.log(`解析到 ${calendars.length} 個行事曆:`, calendars.map(c => c.displayName));
        } catch (error) {
            console.error('解析行事曆列表失敗:', error.message);
        }
        return calendars;
    }

    // 解析事件資料
    parseEvents(xmlData) {
        const events = [];
        try {
            // 提取 iCal 資料
            const icalRegex = /<C:calendar-data>([\s\S]*?)<\/C:calendar-data>/g;
            let match;
            while ((match = icalRegex.exec(xmlData)) !== null) {
                const icalData = match[1];
                const parsedEvents = this.parseICalData(icalData);
                events.push(...parsedEvents);
            }
        } catch (error) {
            console.error('解析事件資料失敗:', error.message);
        }
        return events;
    }

    // 解析 iCal 資料
    parseICalData(icalData) {
        const events = [];
        try {
            const jcalData = ICAL.parse(icalData);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

            vevents.forEach(vevent => {
                try {
                    const event = new ICAL.Event(vevent);
                    
                    // 檢查日期屬性是否存在
                    if (!event.startDate || !event.endDate) {
                        console.log('事件缺少日期資訊，跳過:', event.summary || '無標題');
                        return;
                    }
                    
                    const start = event.startDate.toJSDate();
                    const end = event.endDate.toJSDate();
                    
                    // 檢查日期是否有效
                    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
                        console.log('事件日期無效，跳過:', event.summary || '無標題');
                        return;
                    }
                    
                    events.push({
                        id: event.uid || Math.random().toString(36).substr(2, 9),
                        title: event.summary || '無標題',
                        description: event.description || '',
                        location: event.location || '',
                        start: start,
                        end: end,
                        time: this.formatTimeRange(start, end),
                        date: start,
                        type: this.determineEventType(event.summary),
                        allDay: event.startDate.isDate
                    });
                } catch (eventError) {
                    console.error('處理單個事件失敗:', eventError.message);
                }
            });
        } catch (error) {
            console.error('解析 iCal 資料失敗:', error.message);
        }
        return events;
    }

    // 格式化時間範圍
    formatTimeRange(start, end) {
        if (this.isAllDay(start, end)) {
            return '全天';
        }
        
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);
        return `${startTime}-${endTime}`;
    }

    // 判斷是否為全天事件
    isAllDay(start, end) {
        const diff = end.getTime() - start.getTime();
        return diff >= 24 * 60 * 60 * 1000; // 24小時
    }

    // 判斷事件類型
    determineEventType(summary) {
        if (!summary) return 'other';
        
        const summaryLower = summary.toLowerCase();
        if (summaryLower.includes('課程') || summaryLower.includes('教學')) return 'course';
        if (summaryLower.includes('會議')) return 'meeting';
        if (summaryLower.includes('輔導') || summaryLower.includes('諮詢')) return 'consultation';
        if (summaryLower.includes('考試') || summaryLower.includes('測驗')) return 'exam';
        return 'other';
    }
}

module.exports = CalDAVClient;
