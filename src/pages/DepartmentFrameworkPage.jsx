import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Collapse,
  Icon,
  Button
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const STATIC_CATEGORIES = [
  "Technical Skills",
  "Leadership & Management",
  "Soft Skills",
  "Process & Delivery",
  "Domain-Specific Knowledge",
  "Innovation & Problem-Solving",
  "Customer & Business Acumen"
];

const DepartmentFrameworkPage = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [competenciesByCategory, setCompetenciesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  /** ✅ Fetch Departments and Store IDs & Names */
  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/get-departments"
      );
      if (!response.ok) throw new Error("Failed to fetch departments.");

      const data = await response.json();
      console.log("Fetched Departments:", data); // ✅ Debugging Log

      if (data.departments && Array.isArray(data.departments)) {
        setDepartments(data.departments);
        if (data.departments.length > 0) {
          setSelectedDepartmentId(data.departments[0].id); // ✅ Default to first department
          fetchCompetencies(data.departments[0].id); // ✅ Fetch competencies for default
        }
      } else {
        console.error("Invalid department data format:", data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
    }
  };

  /** ✅ Fetch Competencies using Department ID */
  const fetchCompetencies = async (departmentId) => {
    setLoading(true);
    setError(null);
    setCompetenciesByCategory({});

    try {
      console.log("Fetching competencies for Department ID:", departmentId); // ✅ Debugging

      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-framework/${departmentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch competencies.");

      const data = await response.json();
      console.log("Fetched competencies:", data); // ✅ Debugging

      let categorizedCompetencies = {};
      STATIC_CATEGORIES.forEach((category) => {
        categorizedCompetencies[category] = [];
      });

      data.job_titles.forEach((job) => {
        job.competencies.forEach((competency) => {
          let category = competency.category || "Uncategorized";
          if (!categorizedCompetencies[category]) {
            categorizedCompetencies[category] = [];
          }
          categorizedCompetencies[category].push(competency);
        });
      });

      setCompetenciesByCategory(categorizedCompetencies);
    } catch (err) {
      console.error("Error fetching competencies:", err);
      setError("Failed to fetch competencies.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Toggle Categories */
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Competency Framework
      </Heading>

      {/* ✅ Department Dropdown (Stores ID, Displays Name) */}
      <Select
        placeholder="Select a department"
        onChange={(e) => {
          const selectedId = e.target.value;
          setSelectedDepartmentId(selectedId);
          fetchCompetencies(selectedId);
        }}
        value={selectedDepartmentId || ""}
        mb="4"
      >
        {departments.length > 0 ? (
          departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.department}
            </option>
          ))
        ) : (
          <option disabled>No departments found</option>
        )}
      </Select>

      {loading && <Spinner size="xl" color="purple.500" />}

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* ✅ Competency List with Categories */}
      {!loading && !error && Object.keys(competenciesByCategory).length > 0 && (
        Object.entries(competenciesByCategory).map(([category, competencies]) => (
          <Box key={category} mt="6" border="1px solid #ccc" p="4" borderRadius="md">
            <Heading
              size="md"
              onClick={() => toggleCategory(category)}
              cursor="pointer"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {category}{" "}
              <Icon as={expandedCategories[category] ? FaChevronUp : FaChevronDown} />
            </Heading>
            <Collapse in={expandedCategories[category]}>
              <Table variant="simple" mt="2">
                <Thead>
                  <Tr>
                    <Th>Competency</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {competencies.length > 0 ? (
                    competencies.map((comp, index) => (
                      <Tr key={index}>
                        <Td>{comp.name}</Td>
                        <Td>{comp.descriptions?.default || "No description available"}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={2} textAlign="center">No competencies found</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Collapse>
          </Box>
        ))
      )}
    </Box>
  );
};

export default DepartmentFrameworkPage;
