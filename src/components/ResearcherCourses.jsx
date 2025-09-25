import React from 'react';

const courses = [
    {
        id: 1,
        title: "Web Hacking Fundamentals",
        provider: "HackerOne",
        link: "https://www.hackerone.com/resources/web-hacking-course",
    },
    {
        id: 2,
        title: "Mobile Application Security",
        provider: "Offensive Security",
        link: "https://www.offensive-security.com/",
    },
    {
        id: 3,
        title: "API Pentesting Masterclass",
        provider: "PortSwigger",
        link: "https://portswigger.net/web-security",
    },
];

const ResearcherCourses = () => {
    return (
        <div className="researcher-courses-page">
            <h2 className="text-2xl font-bold mb-4">Career Development & Courses</h2>
            <p className="text-gray-600 mb-6">
                Explore these recommended resources to improve your skills and earn more bounties.
            </p>
            <div className="space-y-4">
                {courses.map(course => (
                    <div key={course.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-lg">{course.title}</div>
                            <div className="text-sm text-gray-500">Provider: {course.provider}</div>
                        </div>
                        <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            Go to Course
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResearcherCourses;
