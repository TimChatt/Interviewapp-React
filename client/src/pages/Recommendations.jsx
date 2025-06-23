import React, { useState, useEffect } from "react";
import ashbyMockData from "../mockdata/ashbyMockData.json";
import {
  Box,
  Heading,
  Text,
  VStack,
  Select,
  Input,
  Grid,
  Card,
  CardBody,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

/**
 * Helper function to parse date strings.
 */
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * Formats skill names by adding spaces to camelCase.
 */
function formatSkillName(skillKey) {
  return skillKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function Recommendations() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");

  useEffect(() => {
    const storedStart = localStorage.getItem("recStartDate");
    const storedEnd = localStorage.getItem("recEndDate");
    const storedJob = localStorage.getItem("recJobTitle");

    if (storedStart) setStartDate(storedStart);
    if (storedEnd) setEndDate(storedEnd);
    if (storedJob) setFilterJobTitle(storedJob);
  }, []);

  useEffect(() => {
    localStorage.setItem("recStartDate", startDate);
    localStorage.setItem("recEndDate", endDate);
    localStorage.setItem("recJobTitle", filterJobTitle);
  }, [startDate, endDate, filterJobTitle]);

  // Gather distinct job titles
  const distinctJobTitles = Array.from(
    new Set(ashbyMockData.map((c) => c.jobTitle || "Unknown"))
  ).sort();

  // Filter by date range
  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  const filteredData = ashbyMockData.filter((candidate) => {
    const interviewDT = parseDate(candidate.interviewDate);
    if (!interviewDT) return false;
    if (startDateObj && interviewDT < startDateObj) return false;
    if (endDateObj && interviewDT > endDateObj) return false;
    return true;
  });

  // Filter by job title if selected
  const jobFilteredData = filterJobTitle
    ? filteredData.filter((c) => (c.jobTitle || "Unknown") === filterJobTitle)
    : filteredData;

  // Group data by job title
  const jobMap = {};
  jobFilteredData.forEach((candidate) => {
    const jobTitle = candidate.jobTitle || "Unknown";
    if (!jobMap[jobTitle]) {
      jobMap[jobTitle] = { hired: [], archived: [] };
    }
    if (candidate.status === "Hired") {
      jobMap[jobTitle].hired.push(candidate);
    } else if (candidate.status === "Archived") {
      jobMap[jobTitle].archived.push(candidate);
    }
  });

  // Generate recommendations
  const recommendations = Object.entries(jobMap).map(([jobTitle, group]) => {
    const { hired, archived } = group;
    let summary = `For "${jobTitle}", there are ${hired.length} hired and ${archived.length} archived candidates.`;
    let bullets = [];

    if (hired.length === 0 && archived.length > 0) {
      summary = `All candidates for "${jobTitle}" in this date range were archived. Consider reviewing your hiring criteria.`;
    } else if (archived.length === 0 && hired.length > 0) {
      summary = `All candidates for "${jobTitle}" were hired. The hiring process seems effective.`;
    }

    // Identify top skill gaps between hired and archived candidates
    const skillGaps = [];
    const allSkills = new Set([...hired, ...archived].flatMap((c) => Object.keys(c.scores || {})));

    allSkills.forEach((skill) => {
      let hiredAvg = 0,
        hiredCount = 0,
        archivedAvg = 0,
        archivedCount = 0;

      hired.forEach((c) => {
        if (c.scores && c.scores[skill] !== undefined) {
          hiredAvg += c.scores[skill];
          hiredCount++;
        }
      });

      archived.forEach((c) => {
        if (c.scores && c.scores[skill] !== undefined) {
          archivedAvg += c.scores[skill];
          archivedCount++;
        }
      });

      if (hiredCount > 0) hiredAvg /= hiredCount;
      if (archivedCount > 0) archivedAvg /= archivedCount;

      const gap = hiredAvg - archivedAvg;
      if (gap > 0.5) {
        bullets.push(
          `Hired candidates scored higher in ${formatSkillName(skill)} (avg ${hiredAvg.toFixed(
            1
          )}) compared to archived candidates (avg ${archivedAvg.toFixed(1)}).`
        );
      }
    });

    return { jobTitle, summary, bullets };
  });

  return (
    <Box minH="100vh" p={8} bg="gray.50">
      <Heading size="xl" textAlign="center" mb={6}>
        Recommendations
      </Heading>

      <Text textAlign="center" mb={6}>
        Insights based on hiring data, skill gaps, and trends.
      </Text>

      {/* Filters */}
      <VStack spacing={4} align="center" mb={8}>
        <Input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          width="250px"
        />
        <Input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          width="250px"
        />
        <Select
          placeholder="Filter by Job Title"
          value={filterJobTitle}
          onChange={(e) => setFilterJobTitle(e.target.value)}
          width="250px"
        >
          {distinctJobTitles.map((job) => (
            <option key={job} value={job}>
              {job}
            </option>
          ))}
        </Select>
      </VStack>

      {/* Recommendations Display */}
      {recommendations.length === 0 ? (
        <Text textAlign="center" fontSize="lg" color="gray.600">
          No recommendations available for the selected filters.
        </Text>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {recommendations.map((rec, idx) => (
            <Card key={idx} p={6} boxShadow="md" borderRadius="lg" bg="white">
              <Heading size="md" color="blue.600">
                {rec.jobTitle}
              </Heading>
              <Text mt={2}>{rec.summary}</Text>
              {rec.bullets.length > 0 && (
                <UnorderedList mt={3}>
                  {rec.bullets.map((bullet, i) => (
                    <ListItem key={i}>{bullet}</ListItem>
                  ))}
                </UnorderedList>
              )}
            </Card>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Recommendations;
