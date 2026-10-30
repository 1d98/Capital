import { BadgeInfo, Blocks, ChevronDown, Scale, ScrollText, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLegalContent } from '../legal'
import { SectionTitle } from './UI'

const icons = [ScrollText, ShieldCheck, BadgeInfo, Blocks]

export function LegalSection() {
  const { i18n } = useTranslation()
  const content = getLegalContent(i18n.language)

  return <section className="panel legal-section">
    <SectionTitle title={content.title} subtitle={content.subtitle} action={<div className="settings-section-icon"><Scale size={20} /></div>} />
    <div className="legal-meta"><span><ShieldCheck size={14} />{content.badge}</span><span>{content.version}</span><span>{content.updated}</span></div>
    <div className="legal-documents">
      {content.documents.map((document, index) => {
        const Icon = icons[index]
        return <details className="legal-document" key={document.id} id={`legal-${document.id}`}>
          <summary><Icon size={18} /><span><strong>{document.title}</strong><small>{document.summary}</small></span><ChevronDown className="legal-chevron" size={17} /></summary>
          <div className="legal-document-content">
            {document.sections.map(section => <section key={section.title}>
              <h3>{section.title}</h3>
              {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              {section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
              {section.links && <div className="legal-links">{section.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div>}
            </section>)}
          </div>
        </details>
      })}
    </div>
  </section>
}
