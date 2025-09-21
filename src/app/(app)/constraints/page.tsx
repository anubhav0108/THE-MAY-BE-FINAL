

"use client";

import { useState, useContext } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DataContext, Constraints } from "@/context/data-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Save, Beaker, TrendingUp, UserMinus, Building2, Calendar as CalendarIcon, AlertCircle, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";


type DayAvailability = {
  active: boolean;
  start: string;
  end: string;
};

const initialAvailability: Record<string, DayAvailability> = {
  Monday: { active: true, start: "09:00", end: "17:00" },
  Tuesday: { active: true, start: "09:00", end: "17:00" },
  Wednesday: { active: true, start: "09:00", end: "17:00" },
  Thursday: { active: true, start: "10:00", end: "16:00" },
  Friday: { active: true, start: "09:00", end: "13:00" },
};


export default function ConstraintsPage() {
  const { toast } = useToast();
  const { faculty, rooms, courses, constraints, setConstraints, scenario, setScenario } = useContext(DataContext);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const [facultyConstraints, setFacultyConstraints] = useState({
    selectedFaculty: '',
    maxConsecutiveHours: 3,
    availability: initialAvailability,
    expertise: '', // e.g., "CS101, CS202"
  });

  const [roomConstraints, setRoomConstraints] = useState({
    selectedRoom: '',
    minCapacity: 50,
    projectorRequired: true,
    availability: initialAvailability,
  });
  
  const [courseConstraintsState, setCourseConstraintsState] = useState({
    selectedCourse: '',
    requiredRoomType: 'any',
  });

  const { programSpecific } = constraints;

  const handleProgramSpecificChange = (type: 'teachingPractice' | 'fieldWork', field: string, value: any) => {
    setConstraints(prev => ({
        ...prev,
        programSpecific: {
            ...prev.programSpecific,
            [type]: {
                ...prev.programSpecific[type],
                [field]: value
            }
        }
    }));
  };

  const handleSave = () => {
    // In a real app, you'd send this data to a backend.
    const allConstraints: Constraints = {
      faculty: {
        ...facultyConstraints,
        expertise: facultyConstraints.expertise.split(',').map(s => s.trim()).filter(Boolean),
      },
      room: roomConstraints,
      course: courseConstraintsState,
      programSpecific: programSpecific
    };
    
    setConstraints(allConstraints);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Constraints Saved!",
      description: "Your preferences and simulation settings have been successfully saved.",
    });
  };

  const handleApplyConstraints = async () => {
    setIsApplying(true);
    
    // Save constraints first
    handleSave();
    
    // Show success message
    toast({
      title: "Constraints Applied!",
      description: "Your constraints have been applied and will be used in the next timetable generation.",
    });
    
    setIsApplying(false);
  };

  const handleFacultyAvailabilityChange = (day: string, field: keyof DayAvailability, value: any) => {
    setFacultyConstraints(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };
  
  const handleRoomAvailabilityChange = (day: string, field: keyof DayAvailability, value: any) => {
    setRoomConstraints(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const MultiSelect = ({ title, options, selected, onSelectedChange }: { title: string, options: {value: string, label: string}[], selected: string[], onSelectedChange: (value: string[]) => void }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (currentValue: string) => {
      const newSelected = selected.includes(currentValue)
        ? selected.filter(item => item !== currentValue)
        : [...selected, currentValue];
      onSelectedChange(newSelected);
    };
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {selected.length > 0 ? `${selected.length} ${title.toLowerCase()} selected` : `Select ${title.toLowerCase()}...`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
                    <CommandEmpty>No {title.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup>
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                onSelect={() => handleSelect(option.value)}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold">Define Constraints</h1>
            <p className="text-muted-foreground">Set the rules and preferences for the timetable generator.</p>
            {hasUnsavedChanges && (
              <div className="mt-2 flex items-center text-amber-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
        </div>
        <div className="flex gap-3">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="mr-2 h-5 w-5" />
            Save Constraints
          </Button>
          <Button 
            size="lg" 
            onClick={handleApplyConstraints}
            disabled={isApplying}
          >
            {isApplying ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Beaker className="mr-2 h-5 w-5" />
            )}
            Apply Constraints
          </Button>
        </div>
      </div>
      
      <Accordion type="multiple" defaultValue={['faculty', 'room', 'course', 'program', 'simulation']} className="space-y-6">
        <AccordionItem value="faculty" className="border-none">
          <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Faculty Constraints</CardTitle>
                  <CardDescription>Set availability, teaching load, and expertise for faculty members.</CardDescription>
                </CardHeader>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="faculty-select">Select Faculty</Label>
                    <Select
                      value={facultyConstraints.selectedFaculty}
                      onValueChange={(value) => {
                        setFacultyConstraints(prev => ({...prev, selectedFaculty: value}));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger id="faculty-select">
                        <SelectValue placeholder="Select a faculty member" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="max-hours">Max Consecutive Hours (Workload)</Label>
                    <Input 
                      id="max-hours" 
                      type="number" 
                      value={facultyConstraints.maxConsecutiveHours}
                      onChange={(e) => {
                        setFacultyConstraints(prev => ({...prev, maxConsecutiveHours: parseInt(e.target.value, 10)}));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Expertise (Course Codes)</Label>
                    <Input 
                      id="expertise" 
                      placeholder="e.g., CS301, PH100"
                      value={facultyConstraints.expertise}
                      onChange={(e) => {
                        setFacultyConstraints(prev => ({...prev, expertise: e.target.value}));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label>Weekly Availability</Label>
                  <div className="mt-2 space-y-4 rounded-lg border p-4">
                    {Object.entries(facultyConstraints.availability).map(([day, avail]) => (
                      <div key={day} className="grid grid-cols-3 items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch 
                              id={`${day}-active-faculty`} 
                              checked={avail.active} 
                              onCheckedChange={(checked) => handleFacultyAvailabilityChange(day, 'active', checked)}
                            />
                            <Label htmlFor={`${day}-active-faculty`} className="font-medium">{day}</Label>
                          </div>
                          <Input 
                            type="time" 
                            value={avail.start}
                            disabled={!avail.active}
                            onChange={(e) => handleFacultyAvailabilityChange(day, 'start', e.target.value)}
                          />
                          <Input 
                            type="time" 
                            value={avail.end}
                            disabled={!avail.active}
                            onChange={(e) => handleFacultyAvailabilityChange(day, 'end', e.target.value)}
                          />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="room" className="border-none">
           <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Room Constraints</CardTitle>
                  <CardDescription>Define room capacity, equipment, and usage rules.</CardDescription>
                </CardHeader>
            </AccordionTrigger>
             <AccordionContent asChild>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="room-select">Select Room</Label>
                      <Select
                        value={roomConstraints.selectedRoom}
                        onValueChange={(value) => setRoomConstraints(prev => ({...prev, selectedRoom: value}))}
                      >
                        <SelectTrigger id="room-select">
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-capacity">Minimum Capacity</Label>
                      <Input 
                        id="min-capacity" 
                        type="number" 
                        value={roomConstraints.minCapacity}
                        onChange={(e) => setRoomConstraints(prev => ({...prev, minCapacity: parseInt(e.target.value, 10)}))}
                      />
                    </div>
                    <div className="items-top flex space-x-2 pt-6">
                      <Checkbox 
                        id="projector-required" 
                        checked={roomConstraints.projectorRequired}
                        onCheckedChange={(checked) => setRoomConstraints(prev => ({...prev, projectorRequired: !!checked}))}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="projector-required"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Requires Projector
                        </label>
                      </div>
                    </div>
                  </div>
                   <div>
                    <Label>Weekly Availability</Label>
                    <div className="mt-2 space-y-4 rounded-lg border p-4">
                      {Object.entries(roomConstraints.availability).map(([day, avail]) => (
                        <div key={day} className="grid grid-cols-3 items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch 
                                id={`${day}-active-room`} 
                                checked={avail.active} 
                                onCheckedChange={(checked) => handleRoomAvailabilityChange(day, 'active', checked)}
                              />
                              <Label htmlFor={`${day}-active-room`} className="font-medium">{day}</Label>
                            </div>
                            <Input 
                              type="time" 
                              value={avail.start}
                              disabled={!avail.active}
                              onChange={(e) => handleRoomAvailabilityChange(day, 'start', e.target.value)}
                            />
                            <Input 
                              type="time" 
                              value={avail.end}
                              disabled={!avail.active}
                              onChange={(e) => handleRoomAvailabilityChange(day, 'end', e.target.value)}
                            />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
             </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="course" className="border-none">
           <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Course Constraints</CardTitle>
                  <CardDescription>Set scheduling rules and requirements for courses.</CardDescription>
                </CardHeader>
            </AccordionTrigger>
             <AccordionContent asChild>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="course-select">Select Course</Label>
                        <Select
                           value={courseConstraintsState.selectedCourse}
                           onValueChange={(value) => setCourseConstraintsState(prev => ({...prev, selectedCourse: value}))}
                        >
                          <SelectTrigger id="course-select">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Required Room Type</Label>
                        <Select
                          value={courseConstraintsState.requiredRoomType}
                           onValueChange={(value) => setCourseConstraintsState(prev => ({...prev, requiredRoomType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Set room type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="Lecture">Lecture Hall</SelectItem>
                            <SelectItem value="Lab">Lab</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                </CardContent>
             </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="program" className="border-none">
           <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Program-Specific Constraints</CardTitle>
                  <CardDescription>Define schedules for activities like teaching practice, internships, or fieldwork.</CardDescription>
                </CardHeader>
            </AccordionTrigger>
             <AccordionContent asChild>
                <CardContent className="space-y-6">
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-lg">Teaching Practice (Weekly Recurring)</CardTitle>
                          <CardDescription>Block out a recurring weekly time slot for off-campus teaching practice (e.g., for B.Ed programs).</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="tp-program">Program/Branch</Label>
                                  <Input 
                                    id="tp-program" 
                                    placeholder="e.g., B.Ed"
                                    value={programSpecific.teachingPractice.program}
                                    onChange={(e) => handleProgramSpecificChange('teachingPractice', 'program', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="tp-day">Day of Week</Label>
                                  <Select
                                    value={programSpecific.teachingPractice.day}
                                    onValueChange={(value) => handleProgramSpecificChange('teachingPractice', 'day', value)}
                                  >
                                      <SelectTrigger id="tp-day">
                                          <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Monday">Monday</SelectItem>
                                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                                          <SelectItem value="Thursday">Thursday</SelectItem>
                                          <SelectItem value="Friday">Friday</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="tp-start">Start Time</Label>
                                  <Input 
                                    id="tp-start"
                                    type="time" 
                                    value={programSpecific.teachingPractice.startTime}
                                    onChange={(e) => handleProgramSpecificChange('teachingPractice', 'startTime', e.target.value)}
                                  />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="tp-end">End Time</Label>
                                  <Input 
                                    id="tp-end"
                                    type="time" 
                                    value={programSpecific.teachingPractice.endTime}
                                    onChange={(e) => handleProgramSpecificChange('teachingPractice', 'endTime', e.target.value)}
                                  />
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                   <Card>
                      <CardHeader>
                          <CardTitle className="text-lg">Internships &amp; Field Work (Date Range)</CardTitle>
                          <CardDescription>Block out a continuous period for full-time internships, projects, or fieldwork.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                           <div className="grid sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="fw-type">Activity Type</Label>
                                <Select
                                  value={programSpecific.fieldWork.activityType}
                                  onValueChange={(value) => handleProgramSpecificChange('fieldWork', 'activityType', value)}
                                >
                                    <SelectTrigger id="fw-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Field Work">Field Work</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                        <SelectItem value="Project Work">Project Work</SelectItem>
                                    </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="fw-program">Associated Program/Branch</Label>
                                <Input 
                                id="fw-program" 
                                placeholder="e.g., Civil Engg."
                                value={programSpecific.fieldWork.program}
                                onChange={(e) => handleProgramSpecificChange('fieldWork', 'program', e.target.value)}
                                />
                            </div>
                           </div>
                           <div className="space-y-2">
                               <Label>Activity Period</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !programSpecific.fieldWork.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {programSpecific.fieldWork.startDate ? (
                                            programSpecific.fieldWork.endDate ? (
                                                <>
                                                {format(new Date(programSpecific.fieldWork.startDate), "LLL dd, y")} -{" "}
                                                {format(new Date(programSpecific.fieldWork.endDate), "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(new Date(programSpecific.fieldWork.startDate), "LLL dd, y")
                                            )
                                        ) : (
                                        <span>Pick a date range</span>
                                        )}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={programSpecific.fieldWork.startDate ? new Date(programSpecific.fieldWork.startDate) : new Date()}
                                        selected={{
                                            from: programSpecific.fieldWork.startDate ? new Date(programSpecific.fieldWork.startDate) : undefined,
                                            to: programSpecific.fieldWork.endDate ? new Date(programSpecific.fieldWork.endDate) : undefined
                                        }}
                                        onSelect={(range) => {
                                            handleProgramSpecificChange('fieldWork', 'startDate', range?.from);
                                            handleProgramSpecificChange('fieldWork', 'endDate', range?.to);
                                        }}
                                        numberOfMonths={2}
                                    />
                                    </PopoverContent>
                                </Popover>
                           </div>
                      </CardContent>
                  </Card>
                </CardContent>
             </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="simulation" className="border-none">
           <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Scenario Simulation & Impact Forecasting</CardTitle>
                  <CardDescription>Temporarily modify inputs to test "what-if" scenarios and forecast their impact.</CardDescription>
                </CardHeader>
            </AccordionTrigger>
             <AccordionContent asChild>
                <CardContent className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="bg-background/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><UserMinus className="h-5 w-5 text-primary" /> Faculty on Leave</CardTitle>
                            <CardDescription>Temporarily mark faculty as unavailable for the next generation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MultiSelect 
                                title="Faculty"
                                options={faculty.map(f => ({ value: f.id, label: f.name }))}
                                selected={scenario.facultyOnLeave}
                                onSelectedChange={(selected) => setScenario(prev => ({ ...prev, facultyOnLeave: selected }))}
                            />
                            <div className="flex flex-wrap gap-1 pt-2 min-h-[24px]">
                                {scenario.facultyOnLeave.map(id => {
                                    const f = faculty.find(fac => fac.id === id);
                                    return f ? <Badge key={id} variant="secondary">{f.name}</Badge> : null;
                                })}
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Unavailable Rooms</CardTitle>
                            <CardDescription>Mark rooms or labs as out-of-service for the next generation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MultiSelect 
                                title="Rooms"
                                options={rooms.map(r => ({ value: r.id, label: r.name }))}
                                selected={scenario.unavailableRooms}
                                onSelectedChange={(selected) => setScenario(prev => ({ ...prev, unavailableRooms: selected }))}
                            />
                            <div className="flex flex-wrap gap-1 pt-2 min-h-[24px]">
                                {scenario.unavailableRooms.map(id => {
                                    const r = rooms.find(room => room.id === id);
                                    return r ? <Badge key={id} variant="secondary">{r.name}</Badge> : null;
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Forecast Impact</CardTitle>
                          <CardDescription>Model how changes in student demand or faculty capacity might affect the timetable.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 p-4 border rounded-lg">
                                <Label>Forecast Elective Popularity</Label>
                                <div className="grid grid-cols-2 gap-4">
                                     <Select 
                                        value={scenario.studentPopularity.courseId} 
                                        onValueChange={(value) => setScenario(prev => ({ ...prev, studentPopularity: { ...prev.studentPopularity, courseId: value } }))}
                                      >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a course..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.filter(c => c.type !== 'Theory').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            value={[scenario.studentPopularity.increase]}
                                            onValueChange={([value]) => setScenario(prev => ({ ...prev, studentPopularity: { ...prev.studentPopularity, increase: value } }))}
                                            max={100}
                                            step={5}
                                            disabled={!scenario.studentPopularity.courseId}
                                        />
                                        <span className="text-sm font-medium w-16 text-right">+{scenario.studentPopularity.increase}%</span>
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-4 p-4 border rounded-lg">
                                <Label>Forecast Faculty Workload Change</Label>
                                <div className="grid grid-cols-2 gap-4">
                                     <Select 
                                        value={scenario.facultyWorkload.facultyId} 
                                        onValueChange={(value) => setScenario(prev => ({ ...prev, facultyWorkload: { ...prev.facultyWorkload, facultyId: value } }))}
                                      >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a faculty..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {faculty.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2">
                                        <Slider
                                            value={[scenario.facultyWorkload.newWorkload]}
                                            onValueChange={([value]) => setScenario(prev => ({ ...prev, facultyWorkload: { ...prev.facultyWorkload, newWorkload: value } }))}
                                            max={20}
                                            step={1}
                                            disabled={!scenario.facultyWorkload.facultyId}
                                        />
                                        <span className="text-sm font-medium w-20 text-right">{scenario.facultyWorkload.newWorkload} hrs/wk</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  </div>
                </CardContent>
             </AccordionContent>
          </Card>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
