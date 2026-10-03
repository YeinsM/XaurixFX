import { ArrowUpRight, BookOpen, Clock, ChartNoAxesCombined, Layers, Compass } from 'lucide-react';
import type { Course } from '../types';
export function CourseCard({course,index,onOpen}:{course:Course;index:number;onOpen:()=>void}) {
 const Icon=[Compass,ChartNoAxesCombined,Layers][index%3];
 return <button className="course-card" onClick={onOpen}><div className={`course-art art-${index%3}`}><span className="course-tag">XAURIX ACADEMY</span><Icon size={64} strokeWidth={1}/><span className="course-number">0{index+1}</span><span className="course-open"><ArrowUpRight size={18}/></span></div><div className="course-info"><span className="eyebrow">{course.level}</span><h3>{course.title}</h3><p className="course-meta"><span><BookOpen size={13}/> {course.lessons} lecciones</span><span><Clock size={13}/> {course.duration}</span></p></div></button>;
}
