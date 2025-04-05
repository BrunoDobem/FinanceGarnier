import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/providers/LanguageProvider";

export function FeedbackForm() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Usando o endpoint do Google Forms com método GET para evitar problemas de CORS
      const formUrl = new URL('https://docs.google.com/forms/d/e/1FAIpQLSdlMsNvFvG6j_wTEuu1ybdK9xwGUoBzHPCbbIQjWTlCpd7vxQ/formResponse');
      formUrl.searchParams.append('entry.529085654', email);
      formUrl.searchParams.append('entry.1438595511', feedback);

      // Usando uma imagem invisível para enviar os dados
      const img = new Image();
      img.src = formUrl.toString();
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      setSubmitStatus('success');
      setEmail('');
      setFeedback('');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>
          Ajude-nos a melhorar nossa plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Suas sugestões
            </label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Conte-nos como podemos melhorar..."
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
          {submitStatus === 'success' && (
            <p className="text-green-500 text-sm text-center">
              Obrigado pelo seu feedback!
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="text-red-500 text-sm text-center">
              Ocorreu um erro ao enviar o feedback. Tente novamente.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 