import React, { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";

const HRPolicyDesign = () => {
  const toast = useToast();

  // Form state variables
  const [business, setBusiness] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [reviewCycle, setReviewCycle] = useState("");
  const [legalConsiderations, setLegalConsiderations] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generatedPolicy, setGeneratedPolicy] = useState("");
  const [loading, setLoading] = useState(false);

  // Handler to generate HR Policy document
  const handleGeneratePolicy = async () => {
    // Basic validation
    if (!business || !policyType) {
      toast({
        title: "Missing Information",
        description: "Please select a business and provide a policy type.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const requestBody = {
      business,
      policyType,
      targetAudience,
      effectiveDate,
      reviewCycle,
      legalConsiderations,
      additionalContext,
    };

    setLoading(true);
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/generate-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) throw new Error("Failed to generate policy document.");
      const data = await response.json();
      setGeneratedPolicy(data.policyDocument);
      toast({
        title: "Policy Generated",
        description: "The HR policy document has been successfully generated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error Generating Policy",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="900px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        HR Policy Design
      </Heading>

      {/* Business Selector */}
      <Select
        placeholder="Select a Sony Sports Business"
        value={business}
        onChange={(e) => setBusiness(e.target.value)}
        mb="4"
      >
        <option value="Hawk-Eye">Hawk-Eye</option>
        <option value="Pulselive">Pulselive</option>
        <option value="Beyond Sports">Beyond Sports</option>
        <option value="Sony Sports">Sony Sports</option>
      </Select>

      {/* Policy Type Input */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4" mb="4">
        <CardBody>
          <Heading size="md" mb="2">
            Policy Type
          </Heading>
          <Textarea
            placeholder="e.g., Code of Conduct, Anti-harassment, Diversity & Inclusion"
            value={policyType}
            onChange={(e) => setPolicyType(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Additional Details */}
      <Card bg="white" shadow="md" borderRadius="lg" p="4" mb="4">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb="2">
                Target Audience
              </Heading>
              <Textarea
                placeholder="e.g., All Employees, Management, Specific Departments"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Effective Date
              </Heading>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                }}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Review Cycle
              </Heading>
              <Textarea
                placeholder="e.g., annually, bi-annually"
                value={reviewCycle}
                onChange={(e) => setReviewCycle(e.target.value)}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Legal & Compliance Considerations
              </Heading>
              <Textarea
                placeholder="Include any relevant legal or regulatory frameworks"
                value={legalConsiderations}
                onChange={(e) => setLegalConsiderations(e.target.value)}
              />
            </Box>
            <Box>
              <Heading size="sm" mb="2">
                Additional Context
              </Heading>
              <Textarea
                placeholder="Provide any additional context or specifics for the policy"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Generate Policy Button */}
      <Button
        colorScheme="blue"
        onClick={handleGeneratePolicy}
        isLoading={loading}
        mb="4"
      >
        Generate Policy Document 🤖
      </Button>

      {/* Display Generated Policy */}
      {generatedPolicy && (
        <Card bg="white" shadow="md" borderRadius="lg" p="4">
          <CardBody>
            <Heading size="md" mb="4">
              Generated HR Policy Document
            </Heading>
            <Text whiteSpace="pre-wrap">{generatedPolicy}</Text>
          </CardBody>
        </Card>
      )}

      {/* Loading Spinner */}
      {loading && (
        <Box textAlign="center" mt="4">
          <Spinner size="xl" />
        </Box>
      )}

      {/* Alert for missing fields or errors can be shown as needed */}
      {/* <Alert status="info" mt="4">
        <AlertIcon />
        Additional messages here.
      </Alert> */}
    </Box>
  );
};

export default HRPolicyDesign;
