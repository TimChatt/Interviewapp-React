import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  VStack,
  HStack,
  Spinner,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import { FaSlidersH, FaSearch } from "react-icons/fa";

// Set your API base URL
const API_BASE_URL = "https://interviewappbe-production.up.railway.app";

const AISourcingTool = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [languages, setLanguages] = useState([]);
  const [diversityFilters, setDiversityFilters] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearch = async () => {
    if (!searchQuery) return;

    setLoading(true);
    setSearchResults([]);
    setSearchHistory([searchQuery, ...searchHistory]);

    try {
      // Use the API_BASE_URL here instead of the placeholder URL
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          filters: {
            location,
            experience,
            skills,
            jobTitle,
            company,
            degree,
            graduationYear,
            languages,
            diversityFilters,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch results");
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" p={6}>
      {/* Search Input Box */}
      <HStack spacing={3} mb={4}>
        <Input
          placeholder="Describe the ideal candidate (e.g. 'Senior Frontend Engineer with React experience in London')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <IconButton icon={<FaSlidersH />} onClick={onOpen} aria-label="Edit Filters" />
        <Button colorScheme="blue" leftIcon={<FaSearch />} onClick={handleSearch}>
          Search
        </Button>
      </HStack>

      {/* Display Latest Search */}
      {searchHistory.length > 0 && (
        <Box mb={4} p={3} bg="gray.100" borderRadius="md">
          <Text fontSize="md" fontWeight="bold">Latest Search:</Text>
          <Text fontSize="sm">{searchHistory[0]}</Text>
        </Box>
      )}

      {loading ? (
        <Spinner size="xl" color="blue.500" mt={4} alignSelf="center" />
      ) : (
        <HStack spacing={6} align="flex-start">
          <Box flex={1}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Job Title</Th>
                  <Th>Company</Th>
                  <Th>Location</Th>
                </Tr>
              </Thead>
              <Tbody>
                {searchResults.map((candidate) => (
                  <Tr key={candidate.id} onClick={() => setSelectedCandidate(candidate)}>
                    <Td>{candidate.name}</Td>
                    <Td>{candidate.jobTitle}</Td>
                    <Td>{candidate.company}</Td>
                    <Td>{candidate.location}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {selectedCandidate && (
            <Box flex={0.4} p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="lg" fontWeight="bold">{selectedCandidate.name}</Text>
              <Text>Job Title: {selectedCandidate.jobTitle}</Text>
              <Text>Company: {selectedCandidate.company}</Text>
              <Text>Location: {selectedCandidate.location}</Text>
            </Box>
          )}
        </HStack>
      )}

      {/* Filters Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Search Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input placeholder="Experience (years)" value={experience} onChange={(e) => setExperience(e.target.value)} />
              <Input placeholder="Skills/Keywords" value={skills} onChange={(e) => setSkills(e.target.value)} />
              <Input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input placeholder="Degree Requirements" value={degree} onChange={(e) => setDegree(e.target.value)} />
              <Input placeholder="Graduation Year" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
              <Input
                placeholder="Languages (comma-separated)"
                value={languages}
                onChange={(e) => setLanguages(e.target.value.split(","))}
              />
              <CheckboxGroup value={diversityFilters} onChange={setDiversityFilters}>
                <Checkbox value="gender">Gender Diversity</Checkbox>
                <Checkbox value="ethnicity">Ethnic Diversity</Checkbox>
                <Checkbox value="career-growth">Career Growth Potential</Checkbox>
              </CheckboxGroup>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>Save Filters</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AISourcingTool;
