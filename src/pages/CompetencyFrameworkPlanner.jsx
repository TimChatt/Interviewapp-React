import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const CompetencyFrameworkPlanner = () => {
  const [framework, setFramework] = useState({
    department: "",
    jobTitle: "",
    jobLevels: [],
    competencies: [],
  });

  const [newJobLevel, setNewJobLevel] = useState("");
  const [newCompetency, setNewCompetency] = useState("");

  const handleInputChange = (field, value) => {
    setFramework((prev) => ({ ...prev, [field]: value }));
  };

  const addJobLevel = () => {
    if (newJobLevel.trim()) {
      setFramework((prev) => ({
        ...prev,
        jobLevels: [...prev.jobLevels, newJobLevel.trim()],
      }));
      setNewJobLevel("");
    }
  };

  const addCompetency = () => {
    if (newCompetency.trim() && framework.jobLevels.length > 0) {
      setFramework((prev) => ({
        ...prev,
        competencies: [
          ...prev.competencies,
          { name: newCompetency.trim(), levels: framework.jobLevels.map(() => "Auto-Generated") },
        ],
      }));
      setNewCompetency("");
    }
  };

  const autoDefineCompetencies = () => {
    setFramework((prev) => {
      const updatedCompetencies = prev.competencies.map((competency) => {
        return {
          ...competency,
          levels: prev.jobLevels.map((level, index) => `Level ${index + 1} competency for ${level}`),
        };
      });
      return { ...prev, competencies: updatedCompetencies };
    });
  };

  const updateCompetencyLevel = (competencyIndex, levelIndex, value) => {
    setFramework((prev) => {
      const updatedCompetencies = [...prev.competencies];
      updatedCompetencies[competencyIndex].levels[levelIndex] = value;
      return { ...prev, competencies: updatedCompetencies };
    });
  };

  const saveFramework = async () => {
    try {
      const response = await fetch('https://interviewappbe-production.up.railway.app/api/competency-framework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(framework),
      });
      if (response.ok) {
        alert('Competency framework saved successfully!');
      } else {
        alert('Failed to save competency framework.');
      }
    } catch (error) {
      console.error('Error saving framework:', error);
      alert('An error occurred while saving the framework.');
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent>
          <h1 className="text-xl font-bold mb-4">Competency Framework Planner</h1>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <Input
                value={framework.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Enter department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <Input
                value={framework.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Levels</label>
              <div className="flex gap-2">
                <Input
                  value={newJobLevel}
                  onChange={(e) => setNewJobLevel(e.target.value)}
                  placeholder="Enter job level"
                />
                <Button onClick={addJobLevel}>Add</Button>
              </div>
              <ul className="list-disc pl-5 mt-2">
                {framework.jobLevels.map((level, index) => (
                  <li key={index}>{level}</li>
                ))}
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Add Competency</label>
              <div className="flex gap-2">
                <Input
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  placeholder="Competency name"
                />
                <Button onClick={addCompetency}>Add</Button>
              </div>
            </div>
            <div>
              <Button onClick={autoDefineCompetencies} className="mt-4">Auto-Define Competencies</Button>
            </div>
            <div>
              <Button onClick={saveFramework} className="mt-4">Save Framework</Button>
            </div>
            <div>
              <h2 className="text-lg font-medium mt-4">Competencies:</h2>
              {framework.competencies.map((competency, compIndex) => (
                <div key={compIndex} className="mt-4">
                  <h3 className="font-medium">{competency.name}</h3>
                  <ul className="list-disc pl-5">
                    {framework.jobLevels.map((level, levelIndex) => (
                      <li key={levelIndex} className="flex gap-2 items-center mt-2">
                        <span className="w-32">{level}:</span>
                        <Input
                          value={competency.levels[levelIndex]}
                          onChange={(e) =>
                            updateCompetencyLevel(compIndex, levelIndex, e.target.value)
                          }
                          placeholder="Define competency"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetencyFrameworkPlanner;
