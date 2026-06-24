import { saveLectures, getLectures } from './db';

const MOCK_DATA = [
  { id: '1', title: 'Data Structures', time: '09:00 AM - 10:30 AM', room: 'Room 301', instructor: 'Dr. Smith', type: 'Lecture' },
  { id: '2', title: 'Calculus II', time: '11:00 AM - 12:30 PM', room: 'Room 205', instructor: 'Prof. Johnson', type: 'Tutorial' },
  { id: '3', title: 'Physics Lab', time: '02:00 PM - 04:00 PM', room: 'Lab 4', instructor: 'Dr. Lee', type: 'Lab' },
  { id: '4', title: 'Web Development', time: '04:15 PM - 05:45 PM', room: 'Room 102', instructor: 'Mr. Brown', type: 'Lecture' }
];

export const fetchTodayLectures = async () => {
  try {
    // Simulate network request
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        // We randomly fail the request 20% of the time to test IndexedDB fallback
        // but for a reliable mock, let's keep it mostly successful
        const shouldFail = Math.random() < 0.2; 
        if (shouldFail) {
           reject(new Error("Network Error"));
        } else {
           resolve({ ok: true, json: () => Promise.resolve(MOCK_DATA) });
        }
      }, 1000); 
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Cache the successful response
    await saveLectures(data);
    
    return data;
  } catch (error) {
    console.warn("Network request failed, falling back to IndexedDB cache", error);
    // Fallback to IndexedDB
    try {
      const cachedData = await getLectures();
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }
      throw new Error("No cached data available.");
    } catch (cacheError) {
      throw new Error("Failed to load lectures. Please check your connection.");
    }
  }
};
